import { Router } from 'express';
import { AgentDecisionController } from '../controllers/agentDecision.controller';
import { protectRoute } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';

const router = Router();

// Change '/agent-decisions' to '/'
router.get('/', protectRoute, isAdmin, AgentDecisionController.list);

// Change '/agent-decisions/stats' to '/stats'
router.get('/stats', protectRoute, isAdmin, AgentDecisionController.stats);

export default router;