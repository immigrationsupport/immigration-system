/*
  Warnings:

  - You are about to drop the column `providerReference` on the `payment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[gatewayTransactionId]` on the table `payment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "payment_providerReference_idx";

-- DropIndex
DROP INDEX "payment_subscriptionId_idx";

-- AlterTable
ALTER TABLE "payment" DROP COLUMN "providerReference",
ADD COLUMN     "gatewayTransactionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "payment_gatewayTransactionId_key" ON "payment"("gatewayTransactionId");
