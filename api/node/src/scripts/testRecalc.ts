import { rankingQueue } from "../queues/ranking.queue"

rankingQueue.add("sweep-gig-scores", {})
    .then(() => {
        console.log("Sweep enqueued manually. Loading.....");
        process.exit(0);
    });