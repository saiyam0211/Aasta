/*
  Warnings:

  - You are about to drop the `otp_codes` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "public"."users" ALTER COLUMN "email" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."otp_codes";
