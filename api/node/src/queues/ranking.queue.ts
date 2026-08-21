import { Queue } from "bullmq";
import { createBullMQConnection } from "../utils/redis";

export const rankingQueue = new Queue("ranking", { connection: createBullMQConnection() });

export async function enqueueRecalculateScore(gigId: string) {
    await rankingQueue.add(
        "recalculate-score",
        { gigId },
        {
            jobId: `recalc${gigId}`,
            removeOnComplete: true,
            removeOnFail: 50, // 50 failures for debugging
            attempts: 3,
            backoff: { type: "exponential", delay: 2000 },
        }
    )
}