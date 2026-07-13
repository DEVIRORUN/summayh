from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
from database import get_db_connection_with_retry
from services.gemini_service import analyze_dispute
from services.agent_logger import log_agent_decision 
import logging


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/disputes", tags=["Disputes"])


class ReviewDisputeRequest(BaseModel):
    disputeId: str


@router.post("/review")
async def review_dispute(payload: ReviewDisputeRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(process_dispute_review, payload.disputeId)
    return {
        "message": "Dispute review queued.",
        "disputedId": payload.disputeId
    }


async def process_dispute_review(dispute_id: str):
    conn = None
    try:
        logger.info(
            f"[Review] Starting dispute check for dispuye {dispute_id}")
        conn = get_db_connection_with_retry()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT
                d.id,
                d.reason,
                d."evidenceUrls",
                o.status,
                o."totalPrice",
                o."tierLabelSnapshot",
                o."deliveryDaysSnapshot",
                o."requirementsSubmittedAt",
                g.title as gig_title
            FROM "Dispute" d
            JOIN "Order" o ON o.id = d."orderId"
            JOIN "Gig" g ON g.id = o."gigId"
            WHERE d.id = %s
            """, (dispute_id,) # the comma aftre is  not just for design it is a tuple
        )

        row = cursor.fetchone()
        if not row:
            print(f"[FastAPI] Dispute {dispute_id} not found")
            return
        (
            dispute_id, reason, evidence_urls, order_status,
            total_price, tier_label, delivery_days,
            requirements_submitted_at, gig_title
        ) = row

        logger.info(
            f"[Dispute] Fetched dipute and order details: dispute_id={dispute_id}")

        order_details = {
            "gig_title": gig_title,
            "tier_label": tier_label,
            "total_price": float(total_price),
            "status": order_status,
            "delivery_days": delivery_days,
            "requirements_submitted": requirements_submitted_at is not None
        }

        logger.info(f"[Dispute] Calling Gemini for spam analysis...")

        result = await analyze_dispute(reason, order_details, evidence_urls or [])

        logger.info(
            f"[Dispute] Gemini returned order_details={order_details}, reasoning={result.get('reasoning', 'N/A')}, evidenceUrls={evidence_urls}")

        logger.info(
            f"[Dispute] Updating DB - aiSummary={result['aiSummary']}, aiRecommendation={result['aiRecommendation']}, aiConfidence={result['aiConfidence']}")

        cursor.execute("""
            UPDATE "Dispute"
            SET
                "aiSummary" = %s,
                "aiRecommendation" = %s,
                "aiConfidence" = %s,
                status = 'AI_REVIEWED',
                "updatedAt" = NOW()
            WHERE id = %s
        """, (
            result["aiSummary"],
            result["aiRecommendation"],
            result["aiConfidence"],
            dispute_id
        ))

        conn.commit()
        logger.info(
            F"[Dispute] ✅ Complete - Dispute {dispute_id} reviewed - {result['aiRecommendation']} ({result['aiConfidence']}:.0%) confindence")
        
        # Log the autonomous decision - fire-and-forget, never blocks or breaks the dispute flow
        await log_agent_decision(
            agent_name="DISPUTE_RESOLUTION",
            entity_id=dispute_id,
            entity_type="Dispute",
            decision=result["aiRecommendation"],
            confidence=result["aiConfidence"],
            reasoning=result["aiSummary"],
            input_summary=f"{gig_title} - {tier_label} - ₦{total_price:,.2f} - reason: {reason[:100]}"
        )
    except Exception as e:
        logger.info(f"[FastAPI] ❌ Error processing dispute {dispute_id}: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()
