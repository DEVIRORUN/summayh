-- CreateEnum
CREATE TYPE "GigDeliveryMode" AS ENUM ('DIGITAL', 'LIVE', 'PHYSICAL');

-- AlterTable
ALTER TABLE "Gig" ADD COLUMN     "deliveryMode" "GigDeliveryMode" NOT NULL DEFAULT 'DIGITAL';
