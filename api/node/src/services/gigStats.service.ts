import { prisma } from "../utils/prisma";


export class GigStatsService {
    /**
     * Increments impressions for a batch of gigs shown in a single search/listing response.
     * Called once per search/browse request, not once per gig — avoids write-storms.
     */
    static async recordImpressions(gigIds: string[]): Promise<any> {
        try {
            if (!gigIds.length) return; // Basically if nothing

            await prisma.gigStats.updateMany({
                where: { gigId: { in: gigIds } },
                data: { impressions: { increment: 1 } }
            });
        } catch(error: any){
            throw error;
        }
    }
    /**
     * Increment clcik count per click from buyer upon gig opening
     */
    static async recordClick(gigId: string): Promise<void> {
        await prisma.gigStats.upsert({
            where: { gigId },
            update: { clicks: { increment: 1 } },
            create: { gigId, clicks: 1 }
        });
    }
}