import { Worker } from "bullmq";
import { createBullMQConnection } from "../utils/redis";
import { CallService } from "../services/call.service";
import { callQueue } from "../utils/queue";

export const callWorker = new Worker(
    "call-sessions",
    async (job) => {
        console.log(`[WORKER]: CALL SESSION`);
        if (job.name === "prepare-room") {
            console.log(`[JOB ${job?.id}]: PREPARE ROOM`);
            await CallService.prepareSessionRoom(job.data.bookingId);
        }
        if (job.name === "flag-no-show") {
            console.log(`[JOB ${job?.id}]: FLAG NO SHOW`);
            await CallService.resolveSessionOutcome(job.data.bookingId);
        }
        if (job.name === "sweep-overdue-sessions") {
            console.log(`[JOB ${job.id}]: SWEEP OVERDUE SESSIONS`);
            await CallService.sweepOverdueSessions();
        }
    },
    { connection: createBullMQConnection() }
);

callWorker.on("failed", (job, err) => {
    console.error(`[JOB ${job?.id} FAILED]:`, err);
});

callQueue.upsertJobScheduler(
    "sweep-overdue-sessions",
    { every: 5 * 60_000 },
    {
        name: "sweep-overdue-sessions",
        data: {},
        opts: {},
    }
);