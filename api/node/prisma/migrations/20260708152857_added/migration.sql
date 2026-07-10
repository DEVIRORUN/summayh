-- AlterEnum
ALTER TYPE "State" ADD VALUE 'INACTIVE';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "commission" DOUBLE PRECISION;
