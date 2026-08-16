from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from database import get_db_connection
from services.gemini_service import run_agentic_search
from services.embedding_service import generate_embedding
from services.agent_logger import log_agent_decision
from services.zero_query_logger import log_zero_result_query
import logging
import uuid

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/search", tags=["Search"])



class SearchRequest(BaseModel):
    query: Optional[str] = ""
    budgetMax: Optional[float] = None
    location: Optional[str] = None
    gigType: Optional[str] = None
    category: Optional[str] = None
    limit: Optional[int] = 20
    page: Optional[int] = 1

@router.post("/gigs")
async def search_gigs(payload: SearchRequest):
    logger.info(f"[Search] Query received: {payload.query!r}, category: {payload.category}")

    filters = {
        "budgetMax": payload.budgetMax,
        "location": payload.location,
        "gigType": payload.gigType
    }

    # Skip agentic for cat
    if payload.query:
        extraction = await run_agentic_search(payload.query, filters)
        logger.info(f"[Search] Gemini extracted: skill='{extraction.get('extractedSkill')}', gigType={extraction.get('gigType')}, terms={extraction.get('searchTerms')}")
    else:
        extraction = {"extractedSkill": None, "gigType": payload.gigType, "searchTerms": [], "rewrittenQuery": None, "urgency": None}

    search_log_id = str(uuid.uuid4())
    await log_agent_decision(
        agent_name="AGENTIC_SEARCH",
        entity_id=search_log_id,
        entity_type="SearchQuery",
        decision=extraction.get("extractedSkill", "unknown"),
        confidence=None,
        reasoning=extraction.get("rewrittenQuery"),
        input_summary=(payload.query or f"[category browse: {payload.category}]")[:150]
    )

    query_embedding = None
    if payload.query:
        try:
            query_embedding = await generate_embedding(payload.query)
        except Exception as e:
            logger.error(f"[Search] Failed to embed query, Pro semantic branch will be skipped: {e}")
            query_embedding = None

    conn = None

    try:
        logger.info(f"[Search] Starting DB search")
        conn = get_db_connection()
        cursor = conn.cursor()

        search_terms = extraction.get('searchTerms') or ([payload.query] if payload.query else [])
        gig_type_filter = extraction.get('gigType', payload.gigType)

        # Shared filter conditions (budget, gigType, category) 
        extra_conditions = ""
        extra_params = []
        if gig_type_filter:
            extra_conditions += ' AND g.service = %s'
            extra_params.append(gig_type_filter)
        if payload.budgetMax:
            extra_conditions += ' AND t.price <= %s'
            extra_params.append(payload.budgetMax)
        if payload.category:
            extra_conditions += ' AND c.id = %s'  # or c.id = %s, if you're passing category ID from frontend instead of name — confirm which
            extra_params.append(payload.category)

        # SEC 1: FREE TIER ----
        if search_terms:
            ilike_conditions = []
            ilike_params = []
            for term in search_terms:
                ilike_conditions.append(
                    '(g.title ILIKE %s OR g.description ILIKE %s OR %s = ANY(g.tags))'
                )
                ilike_params.extend([f"%{term}%", f"%{term}%", term])
            ilike_where = " OR ".join(ilike_conditions)
            text_filter_sql = f"AND ({ilike_where})"
        else:
            # Category-only browse — no text filter at all
            ilike_params = []
            text_filter_sql = ""

        free_query_sql = f"""
            SELECT
                g.id, g.title, g.description, g.tags, g.service,
                g."avgRating", g."totalReviews", g."coverImage", g."baseRankingScore",
                sp."sellerUsername", sp."avgRating" as seller_rating, sp."isPro", sp.avatar,
                MIN(t.price) as starting_price,
                1.0 as relevance
            FROM "Gig" g
            JOIN "SellerProfile" sp ON sp.id = g."sellerId"
            JOIN "GigTier" t ON t."gigId" = g.id
            JOIN "Category" c ON c.id = g."categoryId"
            WHERE g.state = 'ACTIVE'
            AND sp."isPro" = false
            {text_filter_sql}
            {extra_conditions}
            GROUP BY g.id, g.title, g.description, g.tags, g.service,
                        g."avgRating", g."totalReviews", g."coverImage", g."baseRankingScore",
                        sp."sellerUsername", sp."avgRating", sp."isPro", sp.avatar
        """
        free_params = ilike_params + extra_params

        # SEC 2: RO TIER — only run semantic search if we have a real query embedding ----
        pro_query_sql = None
        pro_params = []
        if query_embedding is not None:
            pro_query_sql = f"""
                SELECT
                    g.id, g.title, g.description, g.tags, g.service,
                    g."avgRating", g."totalReviews", g."coverImage", g."baseRankingScore",
                    sp."sellerUsername", sp."avgRating" as seller_rating, sp."isPro", sp.avatar,
                    MIN(t.price) as starting_price,
                    (1 - (g.embedding <=> %s::vector)) as relevance
                FROM "Gig" g
                JOIN "SellerProfile" sp ON sp.id = g."sellerId"
                JOIN "GigTier" t ON t."gigId" = g.id
                JOIN "Category" c ON c.id = g."categoryId"
                WHERE g.state = 'ACTIVE'
                AND sp."isPro" = true
                AND g.embedding IS NOT NULL
                {extra_conditions}
                GROUP BY g.id, g.title, g.description, g.tags, g.service,
                            g."avgRating", g."totalReviews", g."coverImage", g."baseRankingScore",
                            sp."sellerUsername", sp."avgRating", sp."isPro", g.embedding, sp.avatar
                HAVING (1 - (g.embedding <=> %s::vector)) > 0.5
            """
            pro_params = [query_embedding] + extra_params + [query_embedding]

        all_rows = []

        cursor.execute(free_query_sql, free_params)
        all_rows.extend(cursor.fetchall())

        if pro_query_sql:
            cursor.execute(pro_query_sql, pro_params)
            all_rows.extend(cursor.fetchall())

        # sort by baseRankingScore(8) * relevance(14), not price(13)
        all_rows.sort(key=lambda row: (row[8] or 0) * row[14], reverse=True)

        total_found = len(all_rows)
        if total_found == 0 and payload.query:
            await log_zero_result_query(
                query=payload.query,
                gig_type=gig_type_filter,
                location=payload.location,
                budget_max=payload.budgetMax,
                embedding=query_embedding,
            )

        current_page = payload.page if (hasattr(payload, 'page') and payload.page is not None) else 1
        take = payload.limit if payload.limit is not None else 20

        skip = (current_page - 1) * take
        end_index = skip + take

        # Fixed: actually use paginated_rows, not all_rows
        paginated_rows = all_rows[skip:end_index]

        gigs = []
        for row in paginated_rows:  # was iterating all_rows
            gigs.append({
                "id": row[0],
                "title": row[1],
                "decsription": row[2][:150] + "..." if row[2] and len(row[2]) > 150 else (row[2] or ""),
                "tags": row[3],
                "gigType": row[4],
                "avgRating": float(row[5]) if row[5] else 0.0,
                "totalReviews": row[6],
                "coverImage": row[7],
                "sellerUsername": row[9],
                "sellerRating": float(row[10]) if row[10] else 0.0,
                "isPro": bool(row[11]),
                "avatar": row[12],
                "startingPrice": float(row[13]) if row[13] else 0.0,
                "relevance": round(float(row[14]), 4),
            })

        logger.info(f"[Search] Found {len(gigs)} gigs for query '{payload.query}' ({len(all_rows)} before pagination)")

        return {
            "query": payload.query,
            "extracted": {
                "skill": extraction.get("extractedSkill"),
                "gigType": extraction.get("gigType"),
                "urgency": extraction.get("urgency"),
                "searchTerms": extraction.get("searchTerms"),
                "rewrittenQuery": extraction.get("rewrittenQuery"),
            },
            "results": gigs,
            "total": total_found
        }
    except Exception as e:
        logger.error(f"[Search] DB error: {e}")
        return {
            "query": payload.query,
            "extracted": extraction,
            "results": [],
            "total": 0,
            "error": str(e)
        }
    finally:
        if conn:
            conn.close()
