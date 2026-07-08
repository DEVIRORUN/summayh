from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
from database import get_db_connection
from services.gemini_service import detect_review_spam
from datetime import datetime, timezone
import logging



logger = logging.getLogger(__name__)


router = APIRouter(prefix="/api/reviews", tags=["Reviews"]) # for grouping and for prepending


class SpamCheckRequest(BaseModel):
    reviewId: str # a type check like typescript e.g. interface for a funciton in a class


@router.post("/spam-check")
async def spam_check(payload: SpamCheckRequest, background_tasks: BackgroundTasks): #bgtasks runs process_spam_check() separately in bg / a way to run a function after a response is sent
    background_tasks.add_task(process_spam_check, payload.reviewId) # same as fire and forget .catch() for process_spam_check(payload.reviewId) to run afer this func returns
    return { "message": "Spam check queued", "reviewId": payload.reviewId } # This is teh ine that returns the 200 immidiately that it went through

async def process_spam_check(review_id: str):
    conn = None

    try:
        logger.info(f"[Review] Starting spam check for review {review_id}")
        conn = get_db_connection() # psycopg2 connection to Supabase
        cursor = conn.cursor() # like a prepared statement handle

        cursor.execute(
            "SELECT r.id, r.comment, r.\"buyerId\", r.\"createdAt\", u.\"createdAt\", "
            "(SELECT COUNT(*) FROM \"Review\" r2 WHERE r2.\"buyerId\" = r.\"buyerId\" AND r2.\"createdAt\" >= NOW() - INTERVAL '7 days') as recent_reviews, "
            "EXISTS (SELECT 1 FROM \"Order\" o WHERE o.\"buyerId\" = r.\"buyerId\" AND o.\"sellerId\" = r.\"sellerId\" AND o.status = 'COMPLETED' AND o.id != r.\"orderId\") as has_previous_order "
            "FROM \"Review\" r JOIN \"User\" u ON u.id = r.\"buyerId\" WHERE r.id = %s",
            (review_id,)
        ) # fetch review + reviewr context / parameterized query, safe from SQL injection

        row = cursor.fetchone()  # returns one tuple, or None
        if not row:
            print(f"[FastAPI] Review {review_id} not found")
            return
        (review_id, comment, buyer_id, review_created_at,
         user_created_at, recent_reviews, has_previous_order) = row # this matches the SELECT column so we can use them cause it is returned as tupule i.o.w destructure
        
        now = datetime.now(timezone.utc)
        if user_created_at.tzinfo is None:
            user_created_at = user_created_at.replace(tzinfo=timezone.utc)
        account_age_days = (now - user_created_at).days # we wanna get teh account's age in days

        logger.info(f"[Review] Fetched reviewer context: account_age={account_age_days}d, recent_reviews={int(recent_reviews)}")

        reviewer_info = {
            "account_age_days": account_age_days,
            "recent_review_count": int(recent_reviews),
            "has_previous_order": bool(has_previous_order)
        }

        logger.info(f"[Review] Calling Gemini for spam analysis...")

        result = await detect_review_spam(comment, reviewer_info) # calls detect_review from gemini_service.py
        spam_score = float(result["spamScore"])
        should_flag = spam_score > 0.8

        logger.info(f"[Review] Gemini returned spam_score={spam_score:.2f}, reasoning={result.get('reasoning', 'N/A')}")

        logger.info(f"[Review] Updating DB - isFlagged={should_flag}, isPublic={not should_flag}")

        cursor.execute("""
            UPDATE "Review"
            SET "isFlagged" = %s, "isPublic" = %s
            WHERE id = %s
        """, (should_flag, not should_flag, review_id)) # then we update the review in db


        conn.commit() # we commit manually unlike prisma
        logger.info(f"[Review] ✅ Complete - review {review_id}, spam_score: {spam_score:.2f} {'🚩 FLAGGED' if should_flag else '✅ clean'}")

    except Exception as e:
        logger.info(f"[FastAPI] ❌ Error processing review {review_id}: {e}")
        if conn:
            conn.rollback()  # undo any partial DB writes
    finally:
        if conn:
            conn.close() # always release the connection



"""

When i use the swgger ui the uvicorn:


2026-06-27 09:36:46,119 [INFO] [Review] Starting spam check for review 97bdba82-7c21-4f79-a871-a9fbb3479898
2026-06-27 09:37:01,139 [INFO] [FastAPI] ❌ Error processing review 97bdba82-7c21-4f79-a871-a9fbb3479898: could not translate host name "aws-0-eu-west-1.pooler.supabase.com" to address: Temporary failure in name resolution



but when i manually us ethe curl in terminal it workes why??


codespace ➜ /workspaces/summayh/api/fastapi (main) $ curl -X POST http://localhost:8000/api/reviews/spam-check   -H "Content-Type: application/json"   -d '{"reviewId": "97bdba82-7c21-4f79-a871-a9fbb3479898"}'
{"message":"Spam check queued","reviewId":"97bdba82-7c21-4f79-a871-a9fbb3479898"}codespace ➜ /workspaces/summayh/api/fastapi (main) $ 


"""
