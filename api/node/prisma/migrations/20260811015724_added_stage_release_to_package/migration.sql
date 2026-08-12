-- CreateEnum
CREATE TYPE "PackagePayoutStage" AS ENUM ('NONE', 'MIDPOINT_RELEASED', 'FULLY_RELEASED');

-- AlterTable
ALTER TABLE "SessionPackage" ADD COLUMN     "finalReleasedAt" TIMESTAMP(3),
ADD COLUMN     "midpointReleasedAt" TIMESTAMP(3),
ADD COLUMN     "payoutStage" "PackagePayoutStage" NOT NULL DEFAULT 'NONE';
