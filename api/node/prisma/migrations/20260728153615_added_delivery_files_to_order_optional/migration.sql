-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "deliveryFiles" DROP NOT NULL,
ALTER COLUMN "deliveryFiles" SET DATA TYPE TEXT;
