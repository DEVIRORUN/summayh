import { Worker } from "bullmq";
import { createBullMQConnection } from "../utils/redis";
import { ProSubscriptionService } from "../services/proSubscription.service";
import { proQueue } from "../queues/pro.queue";

export const proSubscriptionWorker = new Worker(
    "pro-subscriptions",
    async (job) => {
        if (job.name === "expire-stale-subscriptions") {
            console.log(`[JOB ${job.id}]: EXPIRE STALE SUBSCRIPTIONS`);
            const result = await ProSubscriptionService.expiresStaleSubscriptions();
            console.log(`[JOB ${job.id}]: Expired ${result.expiredCount} subscriptions`);
        }
    },
    { connection: createBullMQConnection() }
);

proSubscriptionWorker.on("failed", (job, err) => {
    console.error(`[JOB ${job?.id} FAILED]:`, err);
});

proQueue.upsertJobScheduler(
    "expire-stale-subscriptions",
    { every: 24 * 60 * 60_000 },
    {
        name: "expire-stale-subscriptions",
        data: {},
        opts: {},
    }
);