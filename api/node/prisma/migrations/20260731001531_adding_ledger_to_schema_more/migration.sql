/*
  Warnings:

  - You are about to drop the column `sellerId` on the `LedgerEntry` table. All the data in the column will be lost.
  - You are about to drop the column `sellerId` on the `Withdrawal` table. All the data in the column will be lost.
  - Added the required column `userId` to the `LedgerEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Withdrawal` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "LedgerEntry" DROP CONSTRAINT "LedgerEntry_sellerId_fkey";

-- DropForeignKey
ALTER TABLE "Withdrawal" DROP CONSTRAINT "Withdrawal_sellerId_fkey";

-- DropIndex
DROP INDEX "LedgerEntry_sellerId_createdAt_idx";

-- DropIndex
DROP INDEX "LedgerEntry_sellerId_status_idx";

-- DropIndex
DROP INDEX "Withdrawal_sellerId_status_idx";

-- AlterTable
ALTER TABLE "LedgerEntry" DROP COLUMN "sellerId",
ADD COLUMN     "sellerProfileId" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Withdrawal" DROP COLUMN "sellerId",
ADD COLUMN     "sellerProfileId" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "LedgerEntry_userId_status_idx" ON "LedgerEntry"("userId", "status");

-- CreateIndex
CREATE INDEX "LedgerEntry_userId_createdAt_idx" ON "LedgerEntry"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Withdrawal_userId_status_idx" ON "Withdrawal"("userId", "status");

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_sellerProfileId_fkey" FOREIGN KEY ("sellerProfileId") REFERENCES "SellerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_sellerProfileId_fkey" FOREIGN KEY ("sellerProfileId") REFERENCES "SellerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
