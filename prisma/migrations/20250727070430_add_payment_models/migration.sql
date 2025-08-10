/*
  Warnings:

  - You are about to drop the column `paymentId` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `restaurants` table. All the data in the column will be lost.
  - Added the required column `ownerName` to the `restaurants` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "paymentId",
ADD COLUMN     "razorpayOrderId" TEXT;

-- AlterTable
ALTER TABLE "restaurants" DROP COLUMN "description",
ADD COLUMN     "ownerName" TEXT NOT NULL,
ALTER COLUMN "cuisineTypes" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "minimumOrderAmount" SET DEFAULT 200;

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "razorpayOrderId" TEXT NOT NULL,
    "razorpayPaymentId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "paymentMethod" TEXT NOT NULL,
    "failureReason" TEXT,
    "capturedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refunds" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "razorpayRefundId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "reason" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_razorpayPaymentId_key" ON "payments"("razorpayPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_orderId_razorpayOrderId_key" ON "payments"("orderId", "razorpayOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "refunds_razorpayRefundId_key" ON "refunds"("razorpayRefundId");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("razorpayPaymentId") ON DELETE RESTRICT ON UPDATE CASCADE;
