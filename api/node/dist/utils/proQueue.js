"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.proQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("./redis");
exports.proQueue = new bullmq_1.Queue("pro-subscriptions", {
    connection: (0, redis_1.createBullMQConnection)(),
});
