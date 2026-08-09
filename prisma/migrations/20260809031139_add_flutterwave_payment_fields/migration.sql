/*
  Warnings:

  - A unique constraint covering the columns `[reference]` on the table `payment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "payment" ADD COLUMN     "flwTransactionId" TEXT,
ADD COLUMN     "targetPlanId" TEXT,
ALTER COLUMN "method" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "payment_reference_key" ON "payment"("reference");

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_targetPlanId_fkey" FOREIGN KEY ("targetPlanId") REFERENCES "plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
