/*
  Warnings:

  - The `status` column on the `SessionBooking` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "SessionBookingStatus" AS ENUM ('SCHEDULED', 'IN_PROGESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SessionOutcome" AS ENUM ('PENDING', 'DONE', 'BUYER_MISSED', 'SELLER_MISSED', 'DISPUTED');

-- AlterTable
ALTER TABLE "SessionBooking" ADD COLUMN     "buyerJoinedAt" TIMESTAMP(3),
ADD COLUMN     "buyerLeftAt" TIMESTAMP(3),
ADD COLUMN     "outcome" "SessionOutcome" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "outcomeNote" TEXT,
ADD COLUMN     "outcomeResolvedAt" TIMESTAMP(3),
ADD COLUMN     "sellerJoinedAt" TIMESTAMP(3),
ADD COLUMN     "sellerLeftAt" TIMESTAMP(3),
DROP COLUMN "status",
ADD COLUMN     "status" "SessionBookingStatus" NOT NULL DEFAULT 'SCHEDULED';
