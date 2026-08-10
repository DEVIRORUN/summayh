"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const agentDecision_controller_1 = require("../controllers/agentDecision.controller");
const auth_1 = require("../middleware/auth");
const isAdmin_1 = require("../middleware/isAdmin"); // adjust path to match your actual file location
const router = (0, express_1.Router)();
/**
 * @openapi
 * /api/admin/agent-decisions:
 *  get:
 *      summary: Paginated list of AI agent decisions, filterable by agent/type/date
 *      tags: [Agent Decisions]
 *      security:
 *          - bearerAuth: []
 */
router.get('/agent-decisions', auth_1.protectRoute, isAdmin_1.isAdmin, agentDecision_controller_1.AgentDecisionController.list);
/**
 * @openapi
 * /api/admin/agent-decisions/stats:
 *  get:
 *      summary: Aggregate stats for the AI agent dashboard (counts, avg confidence, breakdowns, time series)
 *      tags: [Agent Decisions]
 *      security:
 *          - bearerAuth: []
 */
router.get('/agent-decisions/stats', auth_1.protectRoute, isAdmin_1.isAdmin, agentDecision_controller_1.AgentDecisionController.stats);
exports.default = router;
