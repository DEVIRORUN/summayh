/*
  Warnings:

  - The values [MIDPOINT_RELEASED] on the enum `PackagePayoutStage` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `midpointReleasedAt` on the `SessionPackage` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SessionDisputeStatus" AS ENUM ('OPEN', 'AI_REVIEWED', 'UNDER_REVIEW', 'MANUAL_REVIEWED', 'RESOLVED_BUYER', 'RESOLVED_SELLER', 'DISMISSED', 'ESCALATED');

-- AlterEnum
ALTER TYPE "DisputeStatus" ADD VALUE 'UNDER_REVIEW';

-- AlterEnum
BEGIN;
CREATE TYPE "PackagePayoutStage_new" AS ENUM ('NONE', 'TIER1_RELEASED', 'TIER2_RELEASED', 'FULLY_RELEASED');
ALTER TABLE "public"."SessionPackage" ALTER COLUMN "payoutStage" DROP DEFAULT;
ALTER TABLE "SessionPackage" ALTER COLUMN "payoutStage" TYPE "PackagePayoutStage_new" USING ("payoutStage"::text::"PackagePayoutStage_new");
ALTER TYPE "PackagePayoutStage" RENAME TO "PackagePayoutStage_old";
ALTER TYPE "PackagePayoutStage_new" RENAME TO "PackagePayoutStage";
DROP TYPE "public"."PackagePayoutStage_old";
ALTER TABLE "SessionPackage" ALTER COLUMN "payoutStage" SET DEFAULT 'NONE';
COMMIT;

-- AlterTable
ALTER TABLE "SessionPackage" DROP COLUMN "midpointReleasedAt",
ADD COLUMN     "tierOneReleasedAt" TIMESTAMP(3),
ADD COLUMN     "tierTwoReleasedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "SessionDispute" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "raisedById" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "SessionDisputeStatus" NOT NULL DEFAULT 'OPEN',
    "adminNote" TEXT,
    "escalatedDisputeId" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionDispute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SessionDispute_bookingId_key" ON "SessionDispute"("bookingId");

-- AddForeignKey
ALTER TABLE "SessionDispute" ADD CONSTRAINT "SessionDispute_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "SessionBooking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
