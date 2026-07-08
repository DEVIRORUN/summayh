from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from database import get_db_connection
from services.gemini_service import run_agentic_search
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/search", tags=["Search"])

class SearchRequest(BaseModel):
    query: str
    budgetMax: Optional[float] = None
    location: Optional[str] = None
    gigType: Optional[str] = None

@router.post("/gigs")
async def search_gigs(payload: SearchRequest):
    logger.info(f"[Search] Query recieved: {payload.query}")

    #1. Ask Gemini to extract intent from the raw query
    filters = {
        "budgetMax": payload.budgetMax,
        "location": payload.location,
        "gigType": payload.gigType
    }

    extraction = await run_agentic_search(payload.query, filters)
    logger.info(f"[Search] Gemini extracted: skill='{extraction.get('extractedSkill')}', gigType={extraction.get('gigType')}, terms={extraction.get('searchTerms')}")

    # 2. We now use the extracted term to serach the DB
    conn = None

    try:
        logger.info(f"[Search] Starting DB search")
        conn = get_db_connection()
        cursor = conn.cursor()

        # From Gemini or person as fallback
        search_terms = extraction.get('searchTerms', [payload.query])
        gig_type_filter = extraction.get('gigType', payload.gigType)

        # I WILL SWITCH TO tsvector and tsquery or trigram index
        # CREATE EXTENSION pg_trgm;
        # CREATE INDEX gig_title_trgm_idx ON "Gig" USING gin (title gin_trgm_ops);

        # Build a search using ILIKE across title, description, tags
        # Each search term gets matched against all three fields
        conditions = []
        params = []
        for term in search_terms:
            conditions.append(
                '(g.title ILIKE %s OR g.description ILike %s OR %s = ANY(g.tags))'
            )
            params.extend([f"%{term}%", f"%{term}%", term])

        where_clause = " OR ".join(conditions) # conditions goes in here

        # Add gigType filter if extracted
        if gig_type_filter:
            where_clause = f"({where_clause}) AND g.service = %s"
            params.append(gig_type_filter)

        # Add budget gilter if provided
        if payload.budgetMax:
            where_clause += " AND t.price <= %s"
            params.append(payload.budgetMax)
        query_sql = f"""
            SELECT DISTINCT
                g.id,
                g.title,
                g.description,
                g.tags,
                g.service,
                g."avgRating",
                g."totalReviews",
                g."coverImage",
                sp."sellerUsername",
                sp."avgRating" as seller_rating,
                MIN(t.price) as starting_price
            FROM "Gig" g
            JOIN "SellerProfile" sp ON sp.id = g."sellerId"
            JOIN "GigTier" t ON t."gigId" = g.id
            WHERE g.state = 'ACTIVE'
            AND ({where_clause})
            GROUP BY g.id, g.description, g.tags, g.service,
                        g."avgRating", g."totalReviews", g."coverImage",
                        sp."sellerUsername", sp."avgRating"
            ORDER BY g."avgRating" DESC, g."totalReviews" DESC
            LIMIT 20
        """

        cursor.execute(query_sql, params)
        rows = cursor.fetchall()

        gigs =[]
        for row in rows:
            gigs.append({
                "id": row[0],
                "title": row[1],
                "decsription": row[2][:150] + "..." if len(row[2]) > 150 else row[2], # fi shii is greater than 150 char cut to append ... else show full
                "tags": row[3],
                "gigType": row[4],
                "avgRating": float(row[5]) if row[5] else 0, # is it really there? if not default to 0
                "totalReviews": row[6],
                "coverImage": row[7],
                "sellerUsername": row[8],
                "sellerRating": float(row[9]) if row[9] else 0,
                "sellerPrice": float(row[10]) if row[10] else 0
            })

        logger.info(f"[Search] Found {len(gigs)} gigs for query '{payload.query}")

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
            "total": len(gigs)
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

