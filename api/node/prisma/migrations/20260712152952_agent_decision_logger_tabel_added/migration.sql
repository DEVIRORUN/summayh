-- CreateEnum
CREATE TYPE "AgentName" AS ENUM ('DISPUTE_RESOLUTION', 'REVIEW_SPAM_DETECTION', 'PROFILE_CLONER', 'AGENTIC_SEARCH', 'SEMANTIC_MATCH', 'EMBEDDING_GENERATION', 'BIO_GENERATION');

-- CreateTable
CREATE TABLE "AgentDecision" (
    "id" TEXT NOT NULL,
    "agentName" "AgentName" NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,
    "reasoning" TEXT,
    "inputSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentDecision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgentDecision_agentName_idx" ON "AgentDecision"("agentName");

-- CreateIndex
CREATE INDEX "AgentDecision_createdAt_idx" ON "AgentDecision"("createdAt");
