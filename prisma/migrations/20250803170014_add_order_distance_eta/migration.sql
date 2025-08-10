-- AlterTable
ALTER TABLE "public"."order_items" ADD COLUMN     "aastaEarningsPerItem" DOUBLE PRECISION,
ADD COLUMN     "aastaTotalEarnings" DOUBLE PRECISION,
ADD COLUMN     "originalUnitPrice" DOUBLE PRECISION,
ADD COLUMN     "restaurantEarningsPerItem" DOUBLE PRECISION,
ADD COLUMN     "restaurantTotalEarnings" DOUBLE PRECISION,
ADD COLUMN     "totalOriginalPrice" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "deliveryDistance" DOUBLE PRECISION,
ADD COLUMN     "estimatedDeliveryDuration" INTEGER;

-- AlterTable
ALTER TABLE "public"."restaurants" ADD COLUMN     "aastaPricePercentage" DOUBLE PRECISION NOT NULL DEFAULT 0.10,
ADD COLUMN     "restaurantPricePercentage" DOUBLE PRECISION NOT NULL DEFAULT 0.40;
