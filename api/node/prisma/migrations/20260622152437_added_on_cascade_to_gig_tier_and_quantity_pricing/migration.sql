-- DropForeignKey
ALTER TABLE "GigTier" DROP CONSTRAINT "GigTier_gigId_fkey";

-- DropForeignKey
ALTER TABLE "TierQuantityPrice" DROP CONSTRAINT "TierQuantityPrice_gigTierId_fkey";

-- AddForeignKey
ALTER TABLE "GigTier" ADD CONSTRAINT "GigTier_gigId_fkey" FOREIGN KEY ("gigId") REFERENCES "Gig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TierQuantityPrice" ADD CONSTRAINT "TierQuantityPrice_gigTierId_fkey" FOREIGN KEY ("gigTierId") REFERENCES "GigTier"("id") ON DELETE CASCADE ON UPDATE CASCADE;
