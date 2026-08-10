"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("./redis");
exports.callQueue = new bullmq_1.Queue("call-sessions", {
    connection: (0, redis_1.createBullMQConnection)(),
});
