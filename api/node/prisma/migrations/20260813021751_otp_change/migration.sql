/*
  Warnings:

  - A unique constraint covering the columns `[userId,channel]` on the table `OTPVerification` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "OtpChannel" AS ENUM ('PHONE', 'EMAIL');

-- DropIndex
DROP INDEX "OTPVerification_userId_key";

-- AlterTable
ALTER TABLE "OTPVerification" ADD COLUMN     "channel" "OtpChannel" NOT NULL DEFAULT 'PHONE';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "OTPVerification_userId_channel_key" ON "OTPVerification"("userId", "channel");
