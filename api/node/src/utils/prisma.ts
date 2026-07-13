import { PrismaClient } from '../../generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
// console.log("DATABASE_URL:", process.env.DATABASE_URL);

// process.env.DATABASE_URL = process.env.DIRECT_URL || process.env.DATABASE_URL;

const adapter = new PrismaPg({
   connectionString: process.env.DATABASE_URL!,
   max: 8, //  leave headroom — FastAPI and anything else also share the same 15-connection pooler limit
});

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ 
  adapter,
  transactionOptions: {
    maxWait: 10000, // Up to 10s  for a connection to become available
    timeout: 15000, // allow the transaction itself up to 15s to complete
  }
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/*
rgb(31, 31, 30)
rgb(37, 37, 36)
rgb(87,150,218)
rgb(244, 243, 238)
rgb(255, 255, 255)
*/