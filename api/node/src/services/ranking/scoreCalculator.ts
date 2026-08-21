import { GigStatusFlag } from "../../../generated/prisma"; // adjust path to match your actual generated client import

export interface RankingInputs {
    avgRating: number;       
    completedOrders: number;   
    totalTerminalOrders: number;        
    totalOrdersPlaced: number;        
    impressions: number;              
    clicks: number;    
    activityScore: number;     // 0–1
    statusFlag: GigStatusFlag;
    isRookiePeriod: boolean;
}

export interface RankingResult {
    baseRankingScore: number;  // final 8-digit int, 0–99999999
    weightedFloat: number;     // pre-scale float, useful for debugging/logs
    debug: {
        trustScore: number;
        completionRate: number;
        ctr: number;
        conversionRate: number;
    };
}


const WEIGHTS = {
    trust: 0.40,
    completion: 0.25,
    ctr: 0.20,
    conversion: 0.10,
    activity: 0.05,
};

const MAX_SCORE = 99999999;
export const PRIORS = {
    completion: { weight: 10, rate: 0.85 },
    ctr: { weight: 200, rate: 0.03 },
    conversion: { weight: 20, rate: 0.05 },
}

export function smoothedRate(successes: number, total: number, prior: { weight: number; rate:  number }) {
    return (successes + prior.weight * prior.rate) / (total + prior.weight)
}

export function calculateRankingScore(inputs: RankingInputs): RankingResult {
    const trustScore = (inputs.avgRating / 5);

    const completionRate = smoothedRate(inputs.completedOrders, inputs.totalTerminalOrders, PRIORS.completion)
    const ctr = smoothedRate(inputs.clicks, inputs.impressions, PRIORS.ctr)
    const conversionRate = smoothedRate(inputs.totalOrdersPlaced, inputs.clicks, PRIORS.conversion); // this means 2 diff gigs with same number can differ

    let weightedFloat =
        (trustScore * WEIGHTS.trust) +
        (completionRate * WEIGHTS.completion) +
        (ctr * WEIGHTS.ctr) +
        (conversionRate * WEIGHTS.conversion) +
        (inputs.activityScore * WEIGHTS.activity);

    weightedFloat = Math.min(Math.max(weightedFloat, 0), 1);

    if (inputs.statusFlag === GigStatusFlag.SHADOWBAN) {
        weightedFloat = 0;
    } else if (inputs.statusFlag === GigStatusFlag.WARNING) {
        weightedFloat *= 0.5;
    }

    const baseRankingScore = Math.round(weightedFloat * MAX_SCORE);

    return { 
        baseRankingScore, 
        weightedFloat,
        debug: { trustScore, completionRate, ctr, conversionRate }
    };
}