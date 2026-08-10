"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callWorker = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../utils/redis");
const call_service_1 = require("../services/call.service");
const queue_1 = require("../utils/queue");
exports.callWorker = new bullmq_1.Worker("call-sessions", async (job) => {
    console.log(`[WORKER]: CALL SESSION`);
    if (job.name === "prepare-room") {
        console.log(`[JOB ${job?.id}]: PREPARE ROOM`);
        await call_service_1.CallService.prepareSessionRoom(job.data.bookingId);
    }
    if (job.name === "flag-no-show") {
        console.log(`[JOB ${job?.id}]: FLAG NO SHOW`);
        await call_service_1.CallService.flagNoShow(job.data.bookingId);
    }
    if (job.name === "sweep-overdue-sessions") {
        console.log(`[JOB ${job.id}]: SWEEP OVERDUE SESSIONS`);
        await call_service_1.CallService.sweepOverdueSessions();
    }
}, { connection: (0, redis_1.createBullMQConnection)() });
exports.callWorker.on("failed", (job, err) => {
    console.error(`[JOB ${job?.id} FAILED]:`, err);
});
queue_1.callQueue.upsertJobScheduler("sweep-overdue-sessions", { every: 5 * 60_000 }, {
    name: "sweep-overdue-sessions",
    data: {},
    opts: {},
});
