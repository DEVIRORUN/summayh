import { prisma } from "../utils/prisma"

export class AgentDecisionService {
    static async listDecisions(
        page: number = 1,
        limit: number = 30,
        filters: { agentName?: string; entityType?: string; dateForm?: string; dateTo?: string }
    ): Promise<any> {
        const skip = (page - 1) * limit;
        const where: any = {}

        if (filters.agentName) where.agentName = filters.agentName;
        if (filters.entityType) where.entityType = filters.entityType;
        if (filters.dateForm || filters.dateTo) {
            where.createdAt = {};
            if (filters.dateForm) where.createdAt.gte = new Date(filters.dateForm);
            if(filters.dateTo) where.createdAt.lte = new Date(filters.dateTo)
        }

        const [decisions, total] = await Promise.all([
            prisma.agentDecision.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.agentDecision.count({ where })
        ]);

        return {
            decisions,
            meta: {
                total,
                page,
                limit, totalPages: Math.ceil(total / limit)
            }
        }
    }
    static async getStats() {
        const [countsByAgent, avgConfidenceByAgent, decisionBreakdown, dailyTimeSeries] = await Promise.all([
            // Total decisions per agent
            prisma.agentDecision.groupBy({
                by: ['agentName'],
                _count: { id: true }
            }),

            // Average confidence per agent (nulls excluded automatically by Prisma's _avg)
            prisma.agentDecision.groupBy({
                by: ['agentName'],
                _avg: { confidence: true }
            }),

            // Breakdown of decision values per agent
            prisma.agentDecision.groupBy({
                by: ['agentName', 'decision'],
                _count: { id: true }
            }),

            // Daily counts for the last 14 days - raw query since Prisma, aint't capable of truncating well
            prisma.$queryRaw`
                SELECT DATE("createdAt") as day, "agentName", COUNT(*)::int as count
                FROM "AgentDecision"
                WHERE "createdAt" >= NOW() - INTERVAL '14 days'
                GROUP BY DATE("createdAt"), "agentName"
                ORDER BY day ASC
            `
        ]);

        return {
            totalDecisions: countsByAgent.reduce((sum, row) => sum + row._count.id, 0),
            countsByAgent: countsByAgent.map(row => ({
                agentName: row.agentName,
                count: row._count.id
            })),
            avgConfidenceByAgent: avgConfidenceByAgent.map(row => ({
                agentName: row.agentName,
                avgConfidence: row._avg.confidence
            })),
            decisionBreakdown,
            dailyTimeSeries
        };
    }
}