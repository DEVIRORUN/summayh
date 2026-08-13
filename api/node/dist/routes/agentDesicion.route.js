"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const agentDecision_controller_1 = require("../controllers/agentDecision.controller");
const auth_1 = require("../middleware/auth");
const isAdmin_1 = require("../middleware/isAdmin");
const router = (0, express_1.Router)();
// Change '/agent-decisions' to '/'
router.get('/', auth_1.protectRoute, isAdmin_1.isAdmin, agentDecision_controller_1.AgentDecisionController.list);
// Change '/agent-decisions/stats' to '/stats'
router.get('/stats', auth_1.protectRoute, isAdmin_1.isAdmin, agentDecision_controller_1.AgentDecisionController.stats);
exports.default = router;
