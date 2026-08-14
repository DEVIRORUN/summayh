-- AlterTable
ALTER TABLE "OTPVerification" ADD COLUMN     "failedAttempts" INTEGER NOT NULL DEFAULT 0;
