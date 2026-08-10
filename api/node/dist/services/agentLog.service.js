"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentlogService = void 0;
const prisma_1 = require("../utils/prisma");
class AgentlogService {
    static async getAllLogs() {
        try {
            console.log(new Date(), "-> [GET MANY LOGs]: Hit!!!");
            const agent = await prisma_1.prisma.agentDecision.findMany({
                orderBy: { createdAt: "desc" }, // i dont know what to do here
                take: 50, // I don't mind this hard-coded
            });
            console.log(new Date(), "-> [GET MANY LOGs]: Succesfully return Many Log details!!!");
            return agent;
        }
        catch (err) {
            throw err;
        }
    }
    static async getFilteredLogs(filters) {
        try {
            console.log(new Date(), "-> [GET FILTERED LOG]: Hit!!!");
            // we start the "where" empty
            const where = {};
            if (filters.agentName) {
                where.agentName = filters.agentName;
            }
            if (filters.entityType) {
                where.entityType = filters.entityType;
            }
            if (filters.from || filters.to) {
                where.createdAt = {};
                if (filters.from)
                    where.createdAt.gte = new Date(filters.from);
                if (filters.to)
                    where.createdAt.lte = new Date(filters.to);
            }
            const logs = await prisma_1.prisma.agentDecision.findMany({
                where,
                orderBy: { createdAt: "desc" },
                take: 50,
            });
            console.log(new Date(), "-> [GET FILTERED LOG]: Succesfully return Filtered logs!!!");
            return logs;
        }
        catch (err) {
            throw err;
        }
    }
    static async getSingleDetailedLog(logId) {
        try {
            console.log(new Date(), "-> [GET SINGLE LOG]: Hit!!!");
            const log = await prisma_1.prisma.agentDecision.findUnique({
                where: { id: logId },
            });
            if (!log)
                throw new Error("Log not found");
            console.log(new Date(), "-> [GET SINGLE LOG]: Succesfully return Log details!!!");
            return log;
        }
        catch (err) {
            throw err;
        }
    }
}
exports.AgentlogService = AgentlogService;
