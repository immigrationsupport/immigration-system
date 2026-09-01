/*
  Warnings:

  - You are about to drop the column `flwTransactionId` on the `payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "payment" DROP COLUMN "flwTransactionId",
ADD COLUMN     "providerReference" TEXT;

-- CreateIndex
CREATE INDEX "payment_providerReference_idx" ON "payment"("providerReference");
