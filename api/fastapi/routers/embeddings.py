from fastapi import APIRouter
from pydantic import BaseModel
from database import get_db_connection
from services.embedding_service import generate_embedding
from services.agent_logger import log_agent_decision
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/embeddings", tags=["Embeddings"])

class EmbedGigRequest(BaseModel):
    gigId: str
    title: str
    description: str
    tags: list[str]

@router.post("/gig")
async def embed_gig(payload: EmbedGigRequest):
    # Separate the join logic cleanly
    tags_string = ", ".join(payload.tags)

    # Build your text blob effortlessly
    text_blob = f"{payload.title}. {payload.description}. Tags: {tags_string}"

    try:
        embedding = await generate_embedding(text_blob)
    except Exception as e:
        logger.error(f"[Embed Gig] Failed to generate embedding for gig {payload.gigId}: {e}")
        return {"success": False, "error": str(e)}
    
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'UPDATE "Gig" SET embedding = %s WHERE id = %s',
            (embedding, payload.gigId)
        )
        conn.commit()
        logger.info(f"[Embed Gig] Stored embedding for gig {payload.gigId}")

        # Log this autonomous AI action - embedding generation, not a decision per se,
        # but still real AI work running unattended in production
        await log_agent_decision(
            agent_name="EMBEDDING_GENERATION",
            entity_id=payload.gigId,
            entity_type="Gig",
            decision="EMBEDDED",
            confidence=None,
            reasoning=None,
            input_summary=f"{payload.title[:100]} - {len(payload.tags)} tags"
        )
        return {
                "success": True, 
                "data": embedding
            }
    except Exception as e:
        logger.error(f"[Embed Gig] DB error storing embedding: {e}")
        return {"success": False, "error": str(e)}
    finally:
        if conn:
            conn.close() # Work or No-work, we close connection with db