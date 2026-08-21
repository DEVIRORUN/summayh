import { Worker } from "bullmq";
import { createBullMQConnection } from "../utils/redis";
import { recalculateScore } from "../services/ranking/recalculateScore";
import { prisma } from "../utils/prisma";
import { enqueueRecalculateScore, rankingQueue } from "../queues/ranking.queue";

export const rankingWorker = new Worker(
    "ranking",
    async (job) => {
        if (job.name === "recalculate-score") {
            const { gigId } = job.data;
            console.log(`[RANKING WORKER]: Recalculating score for gig ${gigId}`);
            const score = await recalculateScore(gigId);
            console.log(`[RANKING WORKER]: gig ${gigId} -> ${score}`);
            return score;
        }
        if (job.name === "sweep-gig-scores") {
            console.log("[JOB sweep-gig-scores]: Recalculating al active gig scores");
            const activeGigs = await prisma.gig.findMany({
                where: { state: "ACTIVE" },
                select: { id: true }
            });
            for (const g of activeGigs) {
                await enqueueRecalculateScore(g.id);
            }
            console.log(`[JOB sweep-gig-scores]: Enqueued ${activeGigs.length} recalculations`);
            return;
        }
    },
    { connection: createBullMQConnection() }
);


rankingWorker.on("failed", (job, err) => {
    console.error(`[RANKING WORKER]: Job ${job?.id} failed:`, err)
});


rankingQueue.upsertJobScheduler(
    "sweep-gig-scores",
    { every: 6 * 60 * 60_000 },
    {
        name: "sweep-gig-scores",
        data: {},
        opts: {},
    }
)

