"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const prisma_1 = require("../../generated/prisma");
const adapter_pg_1 = require("@prisma/adapter-pg");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../../.env') });
// console.log("DATABASE_URL:", process.env.DATABASE_URL);
// process.env.DATABASE_URL = process.env.DIRECT_URL || process.env.DATABASE_URL;
const adapter = new adapter_pg_1.PrismaPg({
    connectionString: process.env.DATABASE_URL, // this should be DIRECT, right claude???
    max: 8, //  leave headroom — FastAPI and anything else also share the same 15-connection pooler limit
});
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma || new prisma_1.PrismaClient({
    adapter,
    transactionOptions: {
        maxWait: 10000, // Up to 10s  for a connection to become available
        timeout: 15000, // allow the transaction itself up to 15s to complete
    }
});
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = exports.prisma;
}
/*
rgb(31, 31, 30)
rgb(37, 37, 36)
rgb(87,150,218)
rgb(244, 243, 238)
rgb(255, 255, 255)
*/ 
