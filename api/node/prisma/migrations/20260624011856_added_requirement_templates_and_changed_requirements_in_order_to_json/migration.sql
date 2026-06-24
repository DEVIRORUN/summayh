/*
  Warnings:

  - The `requirements` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "RequirementInputType" AS ENUM ('FREE_TEXT', 'MULTIPLE_CHOICE', 'FILE_UPLOAD', 'YES_NO');

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "requirements",
ADD COLUMN     "requirements" JSONB;

-- CreateTable
CREATE TABLE "GigRequirementTemplate" (
    "id" TEXT NOT NULL,
    "gigId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "inputType" "RequirementInputType" NOT NULL DEFAULT 'FREE_TEXT',
    "options" TEXT[],
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GigRequirementTemplate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GigRequirementTemplate" ADD CONSTRAINT "GigRequirementTemplate_gigId_fkey" FOREIGN KEY ("gigId") REFERENCES "Gig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
