import { enqueueRecalculateScore } from "../../queues/ranking.queue";

export const onOrderCompleted = (gigId: string) => enqueueRecalculateScore(gigId);
export const onReviewCreated = (gigId: string) => enqueueRecalculateScore(gigId);
export const onStatusChange = (gigId: string) => enqueueRecalculateScore(gigId);