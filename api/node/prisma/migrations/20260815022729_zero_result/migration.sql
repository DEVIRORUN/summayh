-- CreateTable
CREATE TABLE "ZeroResultQuery" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "normalizedQuery" TEXT NOT NULL,
    "gigType" TEXT,
    "location" TEXT,
    "budgetMax" DOUBLE PRECISION,
    "searchCount" INTEGER NOT NULL DEFAULT 1,
    "lastSearchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ZeroResultQuery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ZeroResultQuery_normalizedQuery_key" ON "ZeroResultQuery"("normalizedQuery");

-- CreateIndex
CREATE INDEX "ZeroResultQuery_searchCount_idx" ON "ZeroResultQuery"("searchCount");
