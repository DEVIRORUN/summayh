"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
exports.createBullMQConnection = createBullMQConnection;
const ioredis_1 = __importDefault(require("ioredis"));
function createBullMQConnection() {
    const redis = new ioredis_1.default(process.env.REDIS_URL, {
        maxRetriesPerRequest: null,
    });
    redis.on("connect", () => console.log("Redis connected"));
    redis.on("error", (err) => console.error("Redis error:", err));
    return redis;
}
exports.redis = new ioredis_1.default(process.env.REDIS_URL);
exports.redis.on("connect", () => console.log("Redis connected"));
exports.redis.on("error", (err) => console.error("Redis error:", err));
