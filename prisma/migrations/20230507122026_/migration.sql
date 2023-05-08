/*
  Warnings:

  - A unique constraint covering the columns `[targetStockGroupEventId]` on the table `Plan` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `targetStockGroupEventId` to the `Plan` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `StockGroupEvent` DROP FOREIGN KEY `StockGroupEvent_planId_fkey`;

-- AlterTable
ALTER TABLE `Plan` ADD COLUMN `targetStockGroupEventId` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Plan_targetStockGroupEventId_key` ON `Plan`(`targetStockGroupEventId`);

-- AddForeignKey
ALTER TABLE `Plan` ADD CONSTRAINT `Plan_targetStockGroupEventId_fkey` FOREIGN KEY (`targetStockGroupEventId`) REFERENCES `StockGroupEvent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
