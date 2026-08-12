import { Queue } from "bullmq";
import { createBullMQConnection } from "./redis";

export const proQueue = new Queue("pro-subscriptions", {
    connection: createBullMQConnection(),
})