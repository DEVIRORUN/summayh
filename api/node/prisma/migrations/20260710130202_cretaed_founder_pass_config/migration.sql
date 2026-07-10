-- CreateTable
CREATE TABLE "FoundersPassConfig" (
    "id" TEXT NOT NULL,
    "priceNaira" DOUBLE PRECISION NOT NULL,
    "maxPasses" INTEGER NOT NULL DEFAULT 250,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "FoundersPassConfig_pkey" PRIMARY KEY ("id")
);
