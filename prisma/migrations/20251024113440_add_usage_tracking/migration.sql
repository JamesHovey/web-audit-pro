-- AlterTable
ALTER TABLE "Audit" ADD COLUMN "estimatedCost" INTEGER;
ALTER TABLE "Audit" ADD COLUMN "actualCost" INTEGER;
ALTER TABLE "Audit" ADD COLUMN "usageMetrics" TEXT;
