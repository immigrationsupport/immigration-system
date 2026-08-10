-- AlterTable
ALTER TABLE "Procedure" ADD COLUMN     "label" TEXT,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "step_template" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "type" "ProcedureType" NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "step_template_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "step_template_agencyId_idx" ON "step_template"("agencyId");

-- CreateIndex
CREATE UNIQUE INDEX "step_template_agencyId_type_key" ON "step_template"("agencyId", "type");

-- AddForeignKey
ALTER TABLE "step_template" ADD CONSTRAINT "step_template_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
