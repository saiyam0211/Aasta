-- DropForeignKey
ALTER TABLE "public"."orders" DROP CONSTRAINT "orders_deliveryAddressId_fkey";

-- AlterTable
ALTER TABLE "public"."orders" ALTER COLUMN "deliveryAddressId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_deliveryAddressId_fkey" FOREIGN KEY ("deliveryAddressId") REFERENCES "public"."addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
