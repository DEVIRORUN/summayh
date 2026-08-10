-- CreateEnum
CREATE TYPE "CallStatus" AS ENUM ('PENDING', 'RINGING', 'ACTIVE', 'ENDED', 'MISSED');

-- CreateEnum
CREATE TYPE "BoardMode" AS ENUM ('DIGITAL', 'CAMERA', 'RESOURCE');

-- CreateTable
CREATE TABLE "CallSession" (
    "id" TEXT NOT NULL,
    "room" TEXT NOT NULL,
    "orderId" TEXT,
    "callerId" TEXT NOT NULL,
    "calleeId" TEXT NOT NULL,
    "status" "CallStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "recordingUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CallSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CallEvent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CallEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoardSession" (
    "id" TEXT NOT NULL,
    "callSessionId" TEXT NOT NULL,
    "model" "BoardMode" NOT NULL DEFAULT 'DIGITAL',
    "eventLogUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BoardSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CallSession_room_key" ON "CallSession"("room");

-- CreateIndex
CREATE INDEX "CallSession_callerId_idx" ON "CallSession"("callerId");

-- CreateIndex
CREATE INDEX "CallSession_calleeId_idx" ON "CallSession"("calleeId");

-- CreateIndex
CREATE INDEX "CallEvent_sessionId_idx" ON "CallEvent"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "BoardSession_callSessionId_key" ON "BoardSession"("callSessionId");

-- AddForeignKey
ALTER TABLE "CallSession" ADD CONSTRAINT "CallSession_callerId_fkey" FOREIGN KEY ("callerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallSession" ADD CONSTRAINT "CallSession_calleeId_fkey" FOREIGN KEY ("calleeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallEvent" ADD CONSTRAINT "CallEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CallSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardSession" ADD CONSTRAINT "BoardSession_callSessionId_fkey" FOREIGN KEY ("callSessionId") REFERENCES "CallSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
