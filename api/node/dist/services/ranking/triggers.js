"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onOrderCompleted = onOrderCompleted;
exports.onReviewCreated = onReviewCreated;
exports.onStatusChange = onStatusChange;
const recalculateScore_1 = require("./recalculateScore");
/**
 * Called after an order's status changes to COMPLETED.
 * Fire-and-forget from the caller's perspective — don't block the order
 * completion response on ranking math.
 */
async function onOrderCompleted(gigId) {
    try {
        await (0, recalculateScore_1.recalculateScore)(gigId);
    }
    catch (err) {
        console.error(`[Ranking]: Failed to recalculate score after order completion for gig ${gigId}:`, err);
    }
}
/**
 * Called after a new review is created for a gig.
 */
async function onReviewCreated(gigId) {
    try {
        await (0, recalculateScore_1.recalculateScore)(gigId);
    }
    catch (err) {
        console.error(`[Ranking]: Failed to recalculate score after review creation for gig ${gigId}:`, err);
    }
}
/**
 * Called when an admin (or automated system) changes a gig's status flag
 * (e.g. issuing a warning or shadowban).
 */
async function onStatusChange(gigId) {
    try {
        await (0, recalculateScore_1.recalculateScore)(gigId);
    }
    catch (err) {
        console.error(`[Ranking]: Failed to recalculate score after status change for gig ${gigId}:`, err);
    }
}
