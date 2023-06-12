/*
  Warnings:

  - The values [RECEIVING,INSTANTIATE] on the enum `Task_type` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `_PlanToStockEvent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_PlanToStockEvent` DROP FOREIGN KEY `_PlanToStockEvent_A_fkey`;

-- DropForeignKey
ALTER TABLE `_PlanToStockEvent` DROP FOREIGN KEY `_PlanToStockEvent_B_fkey`;

-- AlterTable
ALTER TABLE `Plan` ADD COLUMN `assignStockEventId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Task` MODIFY `type` ENUM('CONVERTING', 'GUILLOTINE', 'RELEASE') NOT NULL;

-- DropTable
DROP TABLE `_PlanToStockEvent`;

-- CreateTable
CREATE TABLE `_TargetStockEvent` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_TargetStockEvent_AB_unique`(`A`, `B`),
    INDEX `_TargetStockEvent_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Plan` ADD CONSTRAINT `Plan_assignStockEventId_fkey` FOREIGN KEY (`assignStockEventId`) REFERENCES `StockEvent`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_TargetStockEvent` ADD CONSTRAINT `_TargetStockEvent_A_fkey` FOREIGN KEY (`A`) REFERENCES `Plan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_TargetStockEvent` ADD CONSTRAINT `_TargetStockEvent_B_fkey` FOREIGN KEY (`B`) REFERENCES `StockEvent`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
