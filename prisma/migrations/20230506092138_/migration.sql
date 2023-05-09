/*
  Warnings:

  - You are about to drop the column `planId` on the `StockGroup` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `StockGroup` DROP FOREIGN KEY `StockGroup_planId_fkey`;

-- AlterTable
ALTER TABLE `StockGroup` DROP COLUMN `planId`;

-- AlterTable
ALTER TABLE `StockGroupEvent` ADD COLUMN `planId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `StockGroupEvent` ADD CONSTRAINT `StockGroupEvent_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `Plan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
