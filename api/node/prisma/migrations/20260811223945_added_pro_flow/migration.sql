/*
  Warnings:

  - The values [IN_PROGESS] on the enum `SessionBookingStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "ProPlanInterval" AS ENUM ('MONTHLY', 'YEARLY');

-- AlterEnum
BEGIN;
CREATE TYPE "SessionBookingStatus_new" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
ALTER TABLE "public"."SessionBooking" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "SessionBooking" ALTER COLUMN "status" TYPE "SessionBookingStatus_new" USING ("status"::text::"SessionBookingStatus_new");
ALTER TYPE "SessionBookingStatus" RENAME TO "SessionBookingStatus_old";
ALTER TYPE "SessionBookingStatus_new" RENAME TO "SessionBookingStatus";
DROP TYPE "public"."SessionBookingStatus_old";
ALTER TABLE "SessionBooking" ALTER COLUMN "status" SET DEFAULT 'SCHEDULED';
COMMIT;

-- AlterTable
ALTER TABLE "SessionPackage" ADD COLUMN     "totalAmount" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "ProPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceNaira" DOUBLE PRECISION NOT NULL,
    "interval" "ProPlanInterval" NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "perks" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProSubscription" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "paymentReference" TEXT,
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "ProSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProSubscription_paymentReference_key" ON "ProSubscription"("paymentReference");

-- CreateIndex
CREATE INDEX "ProSubscription_sellerId_idx" ON "ProSubscription"("sellerId");

-- AddForeignKey
ALTER TABLE "ProSubscription" ADD CONSTRAINT "ProSubscription_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "SellerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProSubscription" ADD CONSTRAINT "ProSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "ProPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
