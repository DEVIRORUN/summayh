import { Queue } from "bullmq";
import { createBullMQConnection } from "../utils/redis";

export const callQueue = new Queue("call-sessions", {
    connection: createBullMQConnection(),
});