-- CreateEnum
CREATE TYPE "VerificationCheckStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'PASSED', 'FAILED', 'EXPIRED');

-- CreateTable
CREATE TABLE "IdentityVerification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "VerificationCheckStatus" NOT NULL DEFAULT 'PENDING',
    "nin" TEXT,
    "dateOfBirthOnNin" TIMESTAMP(3),
    "fullNameOnNin" TEXT,
    "livenessPassed" BOOLEAN NOT NULL DEFAULT false,
    "livenessScore" DOUBLE PRECISION,
    "ninMatchPassed" BOOLEAN NOT NULL DEFAULT false,
    "ageVerifiedAdult" BOOLEAN NOT NULL DEFAULT false,
    "failureReason" TEXT,
    "providerRef" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdentityVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IdentityVerification_userId_key" ON "IdentityVerification"("userId");

-- AddForeignKey
ALTER TABLE "IdentityVerification" ADD CONSTRAINT "IdentityVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
