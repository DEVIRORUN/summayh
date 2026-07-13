/*
  Warnings:

  - A unique constraint covering the columns `[sellerId]` on the table `FoundersPassPurchase` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "GigStatusFlag" AS ENUM ('NORMAL', 'WARNING', 'SHADOWBAN');

-- AlterTable
ALTER TABLE "Gig" ADD COLUMN     "baseRankingScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isRookiePeriod" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "rookieExpiredAt" TIMESTAMP(3),
ADD COLUMN     "statusFlag" "GigStatusFlag" NOT NULL DEFAULT 'NORMAL';

-- AlterTable
ALTER TABLE "SellerProfile" ADD COLUMN     "isOnline" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastActiveAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "GigStats" (
    "id" TEXT NOT NULL,
    "gigId" TEXT NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GigStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GigStats_gigId_key" ON "GigStats"("gigId");

-- CreateIndex
CREATE UNIQUE INDEX "FoundersPassPurchase_sellerId_key" ON "FoundersPassPurchase"("sellerId");

-- AddForeignKey
ALTER TABLE "GigStats" ADD CONSTRAINT "GigStats_gigId_fkey" FOREIGN KEY ("gigId") REFERENCES "Gig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
