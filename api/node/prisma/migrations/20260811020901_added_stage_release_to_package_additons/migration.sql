-- AlterTable
ALTER TABLE "SessionBooking" ADD COLUMN     "buyerLeftEarly" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sellerLeftEarly" BOOLEAN NOT NULL DEFAULT false;
