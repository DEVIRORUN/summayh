import { Queue } from "bullmq";
import { createBullMQConnection } from "./redis";

export const callQueue = new Queue("call-sessions", {
    connection: createBullMQConnection(),
});