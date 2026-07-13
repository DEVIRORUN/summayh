import { Router } from 'express';
import { AgentDecisionController } from '../controllers/agentDecision.controller';
import { protectRoute } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin'; // adjust path to match your actual file location

const router = Router();

/**
 * @openapi
 * /api/admin/agent-decisions:
 *  get:
 *      summary: Paginated list of AI agent decisions, filterable by agent/type/date
 *      tags: [Agent Decisions]
 *      security:
 *          - bearerAuth: []
 */
router.get('/agent-decisions', protectRoute, isAdmin, AgentDecisionController.list);

/**
 * @openapi
 * /api/admin/agent-decisions/stats:
 *  get:
 *      summary: Aggregate stats for the AI agent dashboard (counts, avg confidence, breakdowns, time series)
 *      tags: [Agent Decisions]
 *      security:
 *          - bearerAuth: []
 */
router.get('/agent-decisions/stats', protectRoute, isAdmin, AgentDecisionController.stats);

export default router;