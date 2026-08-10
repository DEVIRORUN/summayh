/*
  Warnings:

  - You are about to drop the column `model` on the `BoardSession` table. All the data in the column will be lost.
  - You are about to drop the column `room` on the `CallSession` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[roomName]` on the table `CallSession` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `roomName` to the `CallSession` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PackageStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'PAUSED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'MISSED', 'CANCELLED');

-- DropIndex
DROP INDEX "CallSession_room_key";

-- AlterTable
ALTER TABLE "BoardSession" DROP COLUMN "model",
ADD COLUMN     "mode" "BoardMode" NOT NULL DEFAULT 'DIGITAL';

-- AlterTable
ALTER TABLE "CallSession" DROP COLUMN "room",
ADD COLUMN     "roomName" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "SellerAvailability" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "timeZone" TEXT NOT NULL DEFAULT 'Africa/Lagos',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SellerAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionPackage" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "gigTierid" TEXT NOT NULL,
    "sessionLengthMin" INTEGER NOT NULL,
    "breakLengthMin" INTEGER NOT NULL,
    "totalSessions" INTEGER NOT NULL,
    "sessionused" INTEGER NOT NULL DEFAULT 0,
    "status" "PackageStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "SessionPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionBooking" (
    "id" TEXT NOT NULL,
    "packageId" TEXT,
    "enrollmentId" TEXT,
    "sessionUnitId" TEXT,
    "callSessionId" TEXT,
    "scheduledStart" TIMESTAMP(3) NOT NULL,
    "scheduledEnd" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'SCHEDULED',
    "roadmapStepId" TEXT,

    CONSTRAINT "SessionBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SellerAvailability_sellerId_dayOfWeek_idx" ON "SellerAvailability"("sellerId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "SessionPackage_orderId_key" ON "SessionPackage"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionBooking_callSessionId_key" ON "SessionBooking"("callSessionId");

-- CreateIndex
CREATE INDEX "SessionBooking_packageId_idx" ON "SessionBooking"("packageId");

-- CreateIndex
CREATE INDEX "SessionBooking_enrollmentId_idx" ON "SessionBooking"("enrollmentId");

-- CreateIndex
CREATE INDEX "SessionBooking_scheduledStart_idx" ON "SessionBooking"("scheduledStart");

-- CreateIndex
CREATE UNIQUE INDEX "CallSession_roomName_key" ON "CallSession"("roomName");

-- AddForeignKey
ALTER TABLE "SellerAvailability" ADD CONSTRAINT "SellerAvailability_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "SellerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionPackage" ADD CONSTRAINT "SessionPackage_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionPackage" ADD CONSTRAINT "SessionPackage_gigTierid_fkey" FOREIGN KEY ("gigTierid") REFERENCES "GigTier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionBooking" ADD CONSTRAINT "SessionBooking_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "SessionPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionBooking" ADD CONSTRAINT "SessionBooking_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "CourseEnrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionBooking" ADD CONSTRAINT "SessionBooking_sessionUnitId_fkey" FOREIGN KEY ("sessionUnitId") REFERENCES "GigSessionUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionBooking" ADD CONSTRAINT "SessionBooking_callSessionId_fkey" FOREIGN KEY ("callSessionId") REFERENCES "CallSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallSession" ADD CONSTRAINT "CallSession_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
