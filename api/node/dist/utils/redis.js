"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
exports.createBullMQConnection = createBullMQConnection;
const ioredis_1 = __importDefault(require("ioredis"));
// Determine Redis host and port safely
const DEFAULT_REDIS_URL = process.env.REDIS_URL || "redis://host.docker.internal:6379";
function createBullMQConnection() {
    const redisInstance = new ioredis_1.default(DEFAULT_REDIS_URL, {
        maxRetriesPerRequest: null,
        connectTimeout: 10000,
        keepAlive: 10000,
        retryStrategy(times) {
            if (times > 5) {
                console.error("Redis: giving up after 5 retries");
                return null;
            }
            return Math.min(times * 200, 2000);
        },
    });
    redisInstance.on("connect", () => console.log("BullMQ Redis connected"));
    redisInstance.on("error", (err) => console.error("BullMQ Redis error:", err.message));
    return redisInstance;
}
// Ensure standalone client also falls back to host.docker.internal
exports.redis = new ioredis_1.default(DEFAULT_REDIS_URL);
exports.redis.on("connect", () => console.log("Global Redis connected"));
exports.redis.on("error", (err) => console.error("Global Redis error:", err.message));
