-- AlterTable
ALTER TABLE "Procedure" ADD COLUMN     "requiredDocuments" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "step_template" ADD COLUMN     "requiredDocuments" TEXT[] DEFAULT ARRAY[]::TEXT[];
