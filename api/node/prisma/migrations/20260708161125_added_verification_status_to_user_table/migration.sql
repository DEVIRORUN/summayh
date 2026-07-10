-- CreateEnum
CREATE TYPE "VerificationStat" AS ENUM ('VERIFIED', 'NOTVERIFIED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "verificationStatus" "VerificationStat" NOT NULL DEFAULT 'NOTVERIFIED';
