"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.proSubscriptionWorker = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../utils/redis");
const proSubscription_service_1 = require("../services/proSubscription.service");
const proQueue_1 = require("../utils/proQueue");
exports.proSubscriptionWorker = new bullmq_1.Worker("pro-subscriptions", async (job) => {
    if (job.name === "expire-stale-subscriptions") {
        console.log(`[JOB ${job.id}]: EXPIRE STALE SUBSCRIPTIONS`);
        const result = await proSubscription_service_1.ProSubscriptionService.expiresStaleSubscriptions();
        console.log(`[JOB ${job.id}]: Expired ${result.expiredCount} subscriptions`);
    }
}, { connection: (0, redis_1.createBullMQConnection)() });
exports.proSubscriptionWorker.on("failed", (job, err) => {
    console.error(`[JOB ${job?.id} FAILED]:`, err);
});
proQueue_1.proQueue.upsertJobScheduler("expire-stale-subscriptions", { every: 24 * 60 * 60_000 }, {
    name: "expire-stale-subscriptions",
    data: {},
    opts: {},
});
