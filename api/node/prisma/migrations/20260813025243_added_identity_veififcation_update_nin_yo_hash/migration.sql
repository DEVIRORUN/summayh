/*
  Warnings:

  - You are about to drop the column `nin` on the `IdentityVerification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "IdentityVerification" DROP COLUMN "nin",
ADD COLUMN     "ninHash" TEXT;
