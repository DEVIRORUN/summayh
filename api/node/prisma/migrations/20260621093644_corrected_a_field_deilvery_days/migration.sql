/*
  Warnings:

  - You are about to drop the column `delieveryDays` on the `GigTier` table. All the data in the column will be lost.
  - Added the required column `deliveryDays` to the `GigTier` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GigTier" DROP COLUMN "delieveryDays",
ADD COLUMN     "deliveryDays" INTEGER NOT NULL;
