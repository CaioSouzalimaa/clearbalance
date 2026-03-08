-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('INCOME', 'EXPENSE', 'BOTH');

-- AlterTable
ALTER TABLE "Category" ADD COLUMN "type" "CategoryType" NOT NULL DEFAULT 'BOTH';
