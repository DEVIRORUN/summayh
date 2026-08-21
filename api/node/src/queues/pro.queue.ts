import { Queue } from "bullmq";
import { createBullMQConnection } from "../utils/redis";

export const proQueue = new Queue("pro-subscriptions", {
    connection: createBullMQConnection(),
})