-- AlterTable
ALTER TABLE "public"."delivery_partners" ADD COLUMN     "ratingCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."menu_items" ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "ratingCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."platform_metrics" ADD COLUMN     "platformRatingCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "platformRatingSum" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."restaurants" ADD COLUMN     "pickupExperienceCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pickupExperienceRating" DOUBLE PRECISION NOT NULL DEFAULT 0;
