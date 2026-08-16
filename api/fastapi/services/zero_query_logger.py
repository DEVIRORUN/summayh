import logging, uuid
from datetime import datetime
from database import get_db_connection

logger = logging.getLogger(__name__)

SIMIILARITY_THRESHOLD = 0.85

async def log_zero_result_query(
        query: str, 
        gig_type: str | None, 
        location: str | None, 
        budget_max: float | None,
        embedding: list[float] | None = None):
    if embedding is not None:
        matched = await _match_and_increment_semantic(query, embedding)
        if matched:
            return
    await _upsert_exact(query, gig_type, location, budget_max, embedding)


async def _match_and_increment_semantic(query: str, embedding: list[float]) -> bool:
   conn = None
   try:
       conn = get_db_connection()
       cursor = conn.cursor()
       cursor.execute(
            '''
            SELECT id, query, (1 - (embedding <=> %s::vector)) as similarity
            FROM "ZeroResultQuery"
            WHERE embedding IS NOT NULL
            ORDER BY embedding <=> %s::vector
            LIMIT 1
            ''',
            (embedding, embedding)
       )
       row = cursor.fetchone()

       if row and row[2] >= SIMIILARITY_THRESHOLD:
           existing_id, existing_query, similarity = row
           cursor.execute(
                '''
                UPDATE "ZeroResultQuery"
                SET "searchCount" = "searchCount" + 1,
                    "lastSearchedAt" = %s
                WHERE id = %s
                ''',
                (datetime.utcnow(), existing_id)
           )
           conn.commit()
           logger.info(
                f"[ZeroQuery] Semantic match: '{query}' -> '{existing_query}' "
                f"(similarity={similarity:.3f}), count incremented"
           )
           return True
       
       return False
   except Exception as e:
       logger.error(f"[ZeroQuery] Semantic match failed, will fall back to exact: {e}")
       return False
   finally:
       if conn:
           conn.close()

async def _upsert_exact(
        query: str,
        gig_type: str | None,
        location: str | None,
        budget_max: float | None,
        embedding: list[float] | None,
):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        normalized = query.strip().lower()
        now = datetime.utcnow()
        cursor.execute(
            '''
            INSERT INTO "ZeroResultQuery"
                (id, query, "normalizedQuery", "gigType", location, "budgetMax", "searchCount", "lastSearchedAt", "createdAt")
                VALUES (%s, %s, %s, %s, %s, %s, 1, %s, %s)
                ON CONFLICT ("normalizedQuery")
                DO UPDATE SET
                    "searchCount" = "ZeroResultQuery"."searchCount" + 1,
                    "lastSearchedAt" = EXCLUDED."lastSearchedAt"
            ''',
            (str(uuid.uuid4()), query, normalized, gig_type, location, budget_max, now , now)
        )
        conn.commit()
        logger.info(f"[ZeroQuery] Exact upsert: '{query}")
    except Exception as e:
        logger.error(f"[ZeroQuery] Exact upsert failed: {e}")
    finally:
        if conn:
            conn.close()