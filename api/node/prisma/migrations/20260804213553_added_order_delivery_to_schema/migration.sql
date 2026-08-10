-- CreateTable
CREATE TABLE "OrderDelivery" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "message" TEXT,
    "type" "GigDeliveryMode" NOT NULL DEFAULT 'DIGITAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryFile" (
    "id" TEXT NOT NULL,
    "deliveryId" TEXT,
    "fileKey" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliveryFile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OrderDelivery" ADD CONSTRAINT "OrderDelivery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryFile" ADD CONSTRAINT "DeliveryFile_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "OrderDelivery"("id") ON DELETE SET NULL ON UPDATE CASCADE;
