-- CreateTable
CREATE TABLE "SessionMaterial" (
    "id" TEXT NOT NULL,
    "callSessionId" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SessionMaterial_callSessionId_idx" ON "SessionMaterial"("callSessionId");

-- AddForeignKey
ALTER TABLE "SessionMaterial" ADD CONSTRAINT "SessionMaterial_callSessionId_fkey" FOREIGN KEY ("callSessionId") REFERENCES "CallSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
