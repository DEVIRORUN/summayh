-- CreateEnum
CREATE TYPE "ProSource" AS ENUM ('FOUNDERS', 'SUBSCRIPTION');

-- AlterTable
ALTER TABLE "SellerProfile" ADD COLUMN     "proExpiresAt" TIMESTAMP(3),
ADD COLUMN     "proSource" "ProSource";
