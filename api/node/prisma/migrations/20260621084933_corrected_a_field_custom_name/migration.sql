/*
  Warnings:

  - You are about to drop the column `customNamwe` on the `GigTier` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GigTier" DROP COLUMN "customNamwe",
ADD COLUMN     "customName" TEXT;
