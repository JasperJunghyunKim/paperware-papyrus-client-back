/*
  Warnings:

  - You are about to drop the `_TargetStockEvent` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[assignStockEventId]` on the table `Plan` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `planId` to the `StockEvent` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `_TargetStockEvent` DROP FOREIGN KEY `_TargetStockEvent_A_fkey`;

-- DropForeignKey
ALTER TABLE `_TargetStockEvent` DROP FOREIGN KEY `_TargetStockEvent_B_fkey`;

-- AlterTable
ALTER TABLE `StockEvent` ADD COLUMN `planId` INTEGER NOT NULL;

-- DropTable
DROP TABLE `_TargetStockEvent`;

-- CreateIndex
CREATE UNIQUE INDEX `Plan_assignStockEventId_key` ON `Plan`(`assignStockEventId`);

-- AddForeignKey
ALTER TABLE `StockEvent` ADD CONSTRAINT `StockEvent_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `Plan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
