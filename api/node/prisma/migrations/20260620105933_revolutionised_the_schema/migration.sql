/*
  Warnings:

  - You are about to drop the column `basePrice` on the `Gig` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phoneNumber]` on the table `SellerProfile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `deliveryDaysSnapshot` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gigTierId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revisionCountSnapshot` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tierDescription` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tierLabelSnapshot` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitPriceSnapshot` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Service" AS ENUM ('DIGITAL', 'PHYSICAL');

-- CreateEnum
CREATE TYPE "State" AS ENUM ('ACTIVE', 'PAUSED');

-- CreateEnum
CREATE TYPE "TierLabel" AS ENUM ('BASIC', 'STANDARD', 'PREMIUM');

-- AlterTable
ALTER TABLE "Gig" DROP COLUMN "basePrice",
ADD COLUMN     "service" "Service" NOT NULL DEFAULT 'DIGITAL',
ADD COLUMN     "state" "State" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "tags" TEXT[];

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryDaysSnapshot" INTEGER NOT NULL,
ADD COLUMN     "gigTierId" TEXT NOT NULL,
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "revisionCountSnapshot" INTEGER NOT NULL,
ADD COLUMN     "tierDescription" TEXT NOT NULL,
ADD COLUMN     "tierLabelSnapshot" "TierLabel" NOT NULL,
ADD COLUMN     "tierNameSnapshot" TEXT,
ADD COLUMN     "unitPriceSnapshot" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "SellerProfile" ADD COLUMN     "phoneNumber" TEXT;

-- CreateTable
CREATE TABLE "GigTier" (
    "id" TEXT NOT NULL,
    "gigId" TEXT NOT NULL,
    "label" "TierLabel" NOT NULL,
    "customNamwe" TEXT,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "delieveryDays" INTEGER NOT NULL,
    "revisionCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GigTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TierQuantityPrice" (
    "id" TEXT NOT NULL,
    "gigTierId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "discountPercentage" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TierQuantityPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GigTier_gigId_label_key" ON "GigTier"("gigId", "label");

-- CreateIndex
CREATE UNIQUE INDEX "TierQuantityPrice_gigTierId_quantity_key" ON "TierQuantityPrice"("gigTierId", "quantity");

-- CreateIndex
CREATE UNIQUE INDEX "SellerProfile_phoneNumber_key" ON "SellerProfile"("phoneNumber");

-- AddForeignKey
ALTER TABLE "GigTier" ADD CONSTRAINT "GigTier_gigId_fkey" FOREIGN KEY ("gigId") REFERENCES "Gig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TierQuantityPrice" ADD CONSTRAINT "TierQuantityPrice_gigTierId_fkey" FOREIGN KEY ("gigTierId") REFERENCES "GigTier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_gigTierId_fkey" FOREIGN KEY ("gigTierId") REFERENCES "GigTier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
