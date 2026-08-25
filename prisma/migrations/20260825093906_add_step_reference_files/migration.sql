-- AlterTable
ALTER TABLE "application_sub_step" ADD COLUMN     "referenceFileName" TEXT,
ADD COLUMN     "referenceFileUrl" TEXT;

-- AlterTable
ALTER TABLE "step_template" ADD COLUMN     "referenceFileName" TEXT,
ADD COLUMN     "referenceFileUrl" TEXT;
