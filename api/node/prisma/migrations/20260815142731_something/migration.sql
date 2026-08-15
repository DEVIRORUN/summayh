-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('GOOGLE', 'LOCAL');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "authProvider" "AuthProvider" NOT NULL DEFAULT 'GOOGLE';
