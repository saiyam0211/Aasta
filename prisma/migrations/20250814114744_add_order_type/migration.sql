-- CreateEnum
CREATE TYPE "public"."OrderType" AS ENUM ('DELIVERY', 'PICKUP');

-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "orderType" "public"."OrderType" NOT NULL DEFAULT 'DELIVERY';
