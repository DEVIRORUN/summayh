import { prisma } from '../../utils/prisma'; // adjust to your actual client import
import { calculateRankingScore, smoothedRate, PRIORS } from './scoreCalculator';
import { OrderStatus } from '../../../generated/prisma'; // adjust path as needed

const ACTIVITY_WINDOW_DAYS = 7;
const ROOKIE_WINDOW_HOURS = 72;


const TERMINAL_STATUSES: OrderStatus[] = [
    OrderStatus.COMPLETED,
    OrderStatus.CANCELLED,
    OrderStatus.DISPUTED,
]

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

    const terminalOrders = gig.orders.filter(o => TERMINAL_STATUSES.includes(o.status));
    const completedOrders = gig.orders.filter(o => o.status === OrderStatus.COMPLETED).length;
    const totalTerminalOrders = terminalOrders.length;
    const totalOrdersPlaced = gig.orders.length;

    const impressions = gig.gigStats?.impressions ?? 0;
    const clicks = gig.gigStats?.clicks ?? 0;
    const activityScore = calculateActivityScore(gig.seller.lastActiveAt);

    // 6. Rookie period check — has the 72h window expired?
    const isRookiePeriod = gig.isRookiePeriod &&
        gig.rookieExpiredAt !== null &&
        gig.rookieExpiredAt > new Date();

        const { baseRankingScore, debug } = calculateRankingScore({
            avgRating: gig.seller.avgRating,
            completedOrders,
            totalTerminalOrders,
            totalOrdersPlaced,
            impressions,
            clicks,
            activityScore,
            statusFlag: gig.statusFlag,
            isRookiePeriod,
        });

        console.log(`[RANKING DEBUG] gig ${gigId}:`, JSON.stringify(debug))
        await prisma.gig.update({
            where: { id: gigId },
            data: {
                baseRankingScore,
                ...(gig.isRookiePeriod && !isRookiePeriod ? { isRookiePeriod: false } : {})
            }
        });

        return baseRankingScore;
}

function calculateActivityScore(lastActiveAt: Date | null): number {
    if (!lastActiveAt) return 0;

    const daysSinceActive = (Date.now() - lastActiveAt.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceActive <= ACTIVITY_WINDOW_DAYS){
        return Math.max(1 - (daysSinceActive / ACTIVITY_WINDOW_DAYS), 0)
    }

    return 0;
}