"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentDecisionController = void 0;
const agentDecision_service_1 = require("../services/agentDecision.service");
class AgentDecisionController {
    static async list(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 30;
            const { agentName, entityType, dateForm, dateTo } = req.query;
            const result = await agentDecision_service_1.AgentDecisionService.listDecisions(page, limit, {
                agentName: agentName,
                entityType: entityType,
                dateForm: dateForm,
                dateTo: dateTo,
            });
            return res.status(200).json(result);
        }
        catch (error) {
            console.error(new Date(), "-> [AgentDecision List Error]: ", error.message);
            return res
                .status(500)
                .json({ message: "Failed to fetch agent decisions." });
        }
    }
    static async stats(req, res) {
        try {
            const result = await agentDecision_service_1.AgentDecisionService.getStats();
            return res.status(200).json(result);
        }
        catch (error) {
            console.error(new Date(), "-> [AgentDecision Stats Error]:", error.message);
            return res.status(500).json({ message: "Failed to fetch agent stats." });
        }
    }
}
exports.AgentDecisionController = AgentDecisionController;
