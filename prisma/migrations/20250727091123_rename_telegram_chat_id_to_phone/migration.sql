/*
  Warnings:

  - You are about to drop the column `telegramChatId` on the `delivery_partners` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "delivery_partners" DROP COLUMN "telegramChatId",
ADD COLUMN     "telegramPhone" TEXT;
