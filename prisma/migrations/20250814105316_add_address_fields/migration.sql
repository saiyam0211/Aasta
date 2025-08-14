-- AlterTable
ALTER TABLE "public"."addresses" ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "houseNumber" TEXT,
ADD COLUMN     "locality" TEXT,
ALTER COLUMN "street" DROP NOT NULL,
ALTER COLUMN "city" DROP NOT NULL,
ALTER COLUMN "state" DROP NOT NULL,
ALTER COLUMN "zipCode" DROP NOT NULL;
