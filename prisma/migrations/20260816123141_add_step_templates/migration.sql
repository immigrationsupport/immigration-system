/*
  Warnings:

  - You are about to drop the column `agencyId` on the `step_template` table. All the data in the column will be lost.
  - Added the required column `applicationTemplateId` to the `step_template` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "step_template" DROP CONSTRAINT "step_template_agencyId_fkey";

-- DropIndex
DROP INDEX "step_template_agencyId_idx";

-- DropIndex
DROP INDEX "step_template_agencyId_type_key";

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "applicationTemplateId" TEXT;

-- AlterTable
ALTER TABLE "Procedure" ALTER COLUMN "type" DROP NOT NULL;

-- AlterTable
ALTER TABLE "step_template" DROP COLUMN "agencyId",
ADD COLUMN     "applicationTemplateId" TEXT NOT NULL,
ALTER COLUMN "type" DROP NOT NULL;

-- CreateTable
CREATE TABLE "application_sub_step" (
    "id" TEXT NOT NULL,
    "applicationStepId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "application_sub_step_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_template" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "application_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_step_template" (
    "id" TEXT NOT NULL,
    "stepTemplateId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sub_step_template_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "application_sub_step_applicationStepId_idx" ON "application_sub_step"("applicationStepId");

-- CreateIndex
CREATE INDEX "application_template_agencyId_idx" ON "application_template"("agencyId");

-- CreateIndex
CREATE INDEX "sub_step_template_stepTemplateId_idx" ON "sub_step_template"("stepTemplateId");

-- CreateIndex
CREATE INDEX "step_template_applicationTemplateId_idx" ON "step_template"("applicationTemplateId");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_applicationTemplateId_fkey" FOREIGN KEY ("applicationTemplateId") REFERENCES "application_template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_sub_step" ADD CONSTRAINT "application_sub_step_applicationStepId_fkey" FOREIGN KEY ("applicationStepId") REFERENCES "Procedure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_template" ADD CONSTRAINT "application_template_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "step_template" ADD CONSTRAINT "step_template_applicationTemplateId_fkey" FOREIGN KEY ("applicationTemplateId") REFERENCES "application_template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_step_template" ADD CONSTRAINT "sub_step_template_stepTemplateId_fkey" FOREIGN KEY ("stepTemplateId") REFERENCES "step_template"("id") ON DELETE CASCADE ON UPDATE CASCADE;
