import logging
from database import get_db_connection
from datetime import datetime
import uuid


logger = logging.getLogger(__name__)

async def log_agent_decision(
        agent_name: str,
        entity_id: str,
        entity_type: str,
        decision: str,
        confidence: float | None = None,
        reasoning: str | None = None,
        input_summary: str | None = None
): 
    """
    Writes a permanent record of an AI agent's autonomous decision.
    Called immediately after any agent produces a result — this is the
    single source of truth for "AI made this call live in production."
    """
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            '''
            INSERT INTO "AgentDecision"
                (id, "agentName", "entityId", "entityType", decision, confidence, reasoning, "inputSummary", "createdAt")
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ''',
            (
                str(uuid.uuid4()),
                agent_name,
                entity_id,
                entity_type,
                decision,
                confidence,
                reasoning,
                input_summary,
                datetime.utcnow()
            )
        )
        conn.commit()
        logger.info(f"[AgentLog] {agent_name} decision logged for {entity_type} {entity_id}: {decision}")
    except Exception as e:
        # log and don't raise don't break the decision flow
        logger.error(f"[AgentLog] Failed to log decision: {e}")
    finally:
        if conn:
            conn.close()