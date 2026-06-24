/*
  Warnings:

  - A unique constraint covering the columns `[sellerUsername]` on the table `SellerProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "SellerProfile" ADD COLUMN     "sellerUsername" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "username" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "SellerProfile_sellerUsername_key" ON "SellerProfile"("sellerUsername");
