CREATE EXTENSION IF NOT EXISTS vector;

--AlterTable
ALTER TABLE "Gig" ADD COLUMN embedding vector(768);

-- CreateTable
CREATE INDEX gig_embedding_idx ON "Gig" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);