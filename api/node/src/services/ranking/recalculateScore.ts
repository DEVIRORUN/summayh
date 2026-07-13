import { prisma } from '../../utils/prisma'; // adjust to your actual client import
import { calculateRankingScore } from './scoreCalculator';
import { OrderStatus } from '../../../generated/prisma'; // adjust path as needed

const ACTIVITY_WINDOW_DAYS = 7;
const ROOKIE_WINDOW_HOURS = 72;


/**
 * Pulls all raw metrics for a single gig, computes its ranking score,
 * and writes it back to the DB. This is the single entry point every
 * trigger (order completed, review created, status changed) should call.
 */
export async function recalculateScore(gigId: string): Promise<any> {
    const gig = await prisma.gig.findUnique({
        where: { id: gigId },
        include: {
            gigStats: {
                select: {
                    impressions: true,
                    clicks: true,
                }
            },
            seller: true,
            orders: {
                select: { status: true }
            }
        }
    });

    if (!gig) throw new Error(`Gig not found for score recalculation: ${gigId}`);
    // 1. Trust - form seller's average rating (assumed 0-5 scale, normalize to 0-100)
    const trustScore = (gig.seller.avgRating / 5) * 100;

    // 2. Completion rate - completed vs total orders for this gig
    const totalOrders = gig.orders.length;
    const completedOrders = gig.orders.filter(o => o.status === OrderStatus.COMPLETED).length;
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders): 0;

    // 3. CTR - clicks / impressions from GigStats
    const impressions = gig.gigStats?.impressions ?? 0;
    const clicks = gig.gigStats?.clicks ?? 0;
    const ctr = impressions > 0 ? clicks / impressions : 0;

    // 4. Conversion rate — completed orders / clicks (buyers who clicked AND bought)
    const conversionRate = clicks > 0 ? completedOrders / clicks : 0

    // 5. Activity score — decay based on seller's lastActiveAt
    const activityScore = calculateActivityScore(gig.seller.lastActiveAt);

    // 6. Rookie period check — has the 72h window expired?
    const isRookiePeriod = gig.isRookiePeriod &&
        gig.rookieExpiredAt !== null &&
        gig.rookieExpiredAt > new Date();

        const { baseRankingScore } = calculateRankingScore({
            trustScore,
            completionRate,
            ctr,
            conversionRate,
            activityScore,
            statusFlag: gig.statusFlag,
            isRookiePeriod,
        });

        await prisma.gig.update({
            where: { id: gigId },
            data: {
                baseRankingScore,
                // Flip isRookiePeriod false permanently once expired, so future
                // recalculations skip the expiry check entirely
                ...(gig.isRookiePeriod && !isRookiePeriod ? { isRookiePeriod: false } : {})
            }
        });

        return baseRankingScore;
}

/**
 * Converts seller's lastActiveAt into a 0–1 recency score.
 * Fully active (within the window) = 1.0, stale/never active = 0.0.
 */
function calculateActivityScore(lastActiveAt: Date | null): number {
    if (!lastActiveAt) return 0;

    const daysSinceActive = (Date.now() - lastActiveAt.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceActive <= ACTIVITY_WINDOW_DAYS){
        return Math.max(1 - (daysSinceActive / ACTIVITY_WINDOW_DAYS), 0)
    }

    return 0;
}