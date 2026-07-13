import { GigStatusFlag } from "../../../generated/prisma"; // adjust path to match your actual generated client import

export interface RankingInputs {
    trustScore: number;        // 0–100, from SellerProfile.avgRating scaled up
    completionRate: number;    // 0–1, completed orders / total orders
    ctr: number;               // 0–1, clicks / impressions
    conversionRate: number;    // 0–1, completed orders / clicks
    activityScore: number;     // 0–1, recency-based (e.g. lastActiveAt decay)
    statusFlag: GigStatusFlag;
    isRookiePeriod: boolean;
}

export interface RankingResult {
    baseRankingScore: number;  // final 8-digit int, 0–99999999
    weightedFloat: number;     // pre-scale float, useful for debugging/logs
}

const WEIGHTS = {
    trust: 0.40,
    completion: 0.25,
    ctr: 0.20,
    conversion: 0.10,
    activity: 0.05,
};

const MAX_SCORE = 99999999;
const ROOKIE_BOOST_FLOOR = 0.95;

/**
 * Pure function — takes raw gig/seller metrics, returns the final 8-digit ranking score.
 * No DB calls here. All I/O happens in recalculateScore.ts, which gathers these inputs
 * and calls this function.
 */
export function calculateRankingScore(inputs: RankingInputs): RankingResult {
    // Normalize trustScore (0–100) down to 0–1 to match the other metrics before weighting
    const normalizedTrust = inputs.trustScore / 100;

    let weightedFloat =
        (normalizedTrust * WEIGHTS.trust) +
        (inputs.completionRate * WEIGHTS.completion) +
        (inputs.ctr * WEIGHTS.ctr) +
        (inputs.conversionRate * WEIGHTS.conversion) +
        (inputs.activityScore * WEIGHTS.activity);

    // Clamp defensively — weighted sum should never exceed 1.0, but guard against bad inputs
    weightedFloat = Math.min(Math.max(weightedFloat, 0), 1);

    // Apply status flag suppression/kill-switch
    if (inputs.statusFlag === GigStatusFlag.SHADOWBAN) {
        weightedFloat = 0;
    } else if (inputs.statusFlag === GigStatusFlag.WARNING) {
        weightedFloat *= 0.5;
    }

    // Apply rookie boost override - forces score up during the 72h trial window,
    // but never overrides a shadowban (a banned rookie stays banned)
    if (inputs.isRookiePeriod && inputs.statusFlag !== GigStatusFlag.SHADOWBAN) {
        weightedFloat = Math.max(weightedFloat, ROOKIE_BOOST_FLOOR);
    }

    const baseRankingScore = Math.round(weightedFloat * MAX_SCORE);

    return { baseRankingScore, weightedFloat };
}