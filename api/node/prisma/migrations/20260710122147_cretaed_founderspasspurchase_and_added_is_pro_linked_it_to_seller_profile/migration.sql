-- CreateEnum
CREATE TYPE "StatusFounders" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "SellerProfile" ADD COLUMN     "founderBadge" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "founderPassAt" TIMESTAMP(3),
ADD COLUMN     "isPro" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "FoundersPassPurchase" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentRefernce" TEXT NOT NULL,
    "status" "StatusFounders" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "FoundersPassPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FoundersPassPurchase_paymentRefernce_key" ON "FoundersPassPurchase"("paymentRefernce");

-- AddForeignKey
ALTER TABLE "FoundersPassPurchase" ADD CONSTRAINT "FoundersPassPurchase_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "SellerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
