"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentLogController = void 0;
const agentLog_service_1 = require("../services/agentLog.service");
const prismaErrorHandler_1 = require("../utils/prismaErrorHandler");
class AgentLogController {
    static async getAllLogs(req, res) {
        try {
            const logs = await agentLog_service_1.AgentlogService.getAllLogs();
            return res.status(200).json({
                message: "Get all logs succesful",
                data: logs
            });
        }
        catch (error) {
            console.error("ERROR GETTING LOGS bro: ", error);
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            // Fallback for really unexpected errors
            return res.status(500).json({ message: "Failed to get logs. Please try again." });
        }
    }
    static async getFilteredLogs(req, res) {
        try {
            const { agentName, entityType, from, to } = req.query;
            const logs = await agentLog_service_1.AgentlogService.getFilteredLogs({
                agentName: agentName,
                entityType: entityType,
                from: from,
                to: to,
            });
            return res.status(200).json({
                message: "Get filtered logs successful",
                data: logs
            });
        }
        catch (error) {
            console.error("ERROR GETTING FILTERED LOGS bro: ", error);
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res.status(500).json({ message: "Failed to get filtered logs. Please try again." });
        }
    }
    static async getSingleDetailedLog(req, res) {
        try {
            const { logId } = req.params;
            const log = await agentLog_service_1.AgentlogService.getSingleDetailedLog(logId);
            return res.status(200).json({
                message: "Get single log successful",
                data: log
            });
        }
        catch (error) {
            console.error("ERROR GETTING SINGLE LOG bro: ", error);
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res.status(500).json({ message: "Failed to get log. Please try again." });
        }
    }
}
exports.AgentLogController = AgentLogController;
