from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
from database import get_db_connection_with_retry
from services.gemini_service import bio_generation
from services.agent_logger import log_agent_decision
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/bio-generation", tags=["Bio-Generation"])


class BioGenerationRequest(BaseModel):
    userId: str
    skills: list[str]
    university: str
    order_count: int
    portfolio_count: int  # Dont know what ths means


@router.post("/bio-generate")
async def bio_generate(payload: BioGenerationRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(process_bio_generation, payload)
    return {"message": "Bio generation queued", "userId": payload.userId}






async def process_bio_generation(payload: BioGenerationRequest):
    conn = None
    try:
        logger.info(f"[Bio Generation] Generating bio for user {payload.userId}")

        user_info = {
            "skills": payload.skills,
            "university": payload.university,
            "order_count": payload.order_count,
            "portfolio_count": payload.portfolio_count
        }

        result = await bio_generation(user_info)
        ai_bio = result.get("aiBio", "Could not generate bio")

        logger.info(f"[Bio Generation] Generated: {ai_bio}")

        conn = get_db_connection_with_retry()
        cursor = conn.cursor()
        cursor.execute(
            'UPDATE "SellerProfile" SET "aiBio"  =%s WHERE "userId" = %s',
            (ai_bio, payload.userId)
        )

        conn.cursor

        logger.info(f"[Bio Generation] ✅ Saved bio for user {payload.userId}")

        # Log the aiBio decision
        await log_agent_decision(
            agent_name="BIO_GENERATION",
            entity_id=payload.userId,
            entity_type="BioGeneration",
            decision=ai_bio,
            confidence=result.get("confidence"),
            reasoning=result.get("reasoning"),
            input_summary=f"{', '.join(payload.skills)} - {payload.university} - {payload.order_count} orders, {payload.portfolio_count} portfolio items"
        )

    except Exception as e:
        logger.error(f"[Bio Generation] ❌ Error generating bio for {payload.userId}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()