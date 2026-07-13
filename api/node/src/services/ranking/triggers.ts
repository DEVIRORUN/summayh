import { recalculateScore } from "./recalculateScore";

/**
 * Called after an order's status changes to COMPLETED.
 * Fire-and-forget from the caller's perspective — don't block the order
 * completion response on ranking math.
 */
export async function onOrderCompleted(gigId: string): Promise<any> {
    try {
        await recalculateScore(gigId)
    } catch(err) {
        console.error(`[Ranking]: Failed to recalculate score after order completion for gig ${gigId}:`, err);
    }
}
/**
 * Called after a new review is created for a gig.
 */
export async function onReviewCreated(gigId: string) {
    try {
        await recalculateScore(gigId);
    } catch(err) {
        console.error(`[Ranking]: Failed to recalculate score after review creation for gig ${gigId}:`, err);
    }
}
/**
 * Called when an admin (or automated system) changes a gig's status flag
 * (e.g. issuing a warning or shadowban).
 */
export async function onStatusChange(gigId: string): Promise<any> {
    try {
        await recalculateScore(gigId);
    } catch(err) {
        console.error(`[Ranking]: Failed to recalculate score after status change for gig ${gigId}:`, err);
    }
}