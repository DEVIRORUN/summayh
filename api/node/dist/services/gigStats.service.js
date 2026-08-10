"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GigStatsService = void 0;
const prisma_1 = require("../utils/prisma");
class GigStatsService {
    /**
     * Increments impressions for a batch of gigs shown in a single search/listing response.
     * Called once per search/browse request, not once per gig — avoids write-storms.
     */
    static async recordImpressions(gigIds) {
        try {
            if (!gigIds.length)
                return; // Basically if nothing
            await prisma_1.prisma.gigStats.updateMany({
                where: { gigId: { in: gigIds } },
                data: { impressions: { increment: 1 } }
            });
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Increment clcik count per click from buyer upon gig opening
     */
    static async recordClick(gigId) {
        await prisma_1.prisma.gigStats.upsert({
            where: { gigId },
            update: { clicks: { increment: 1 } },
            create: { gigId, clicks: 1 }
        });
    }
}
exports.GigStatsService = GigStatsService;
