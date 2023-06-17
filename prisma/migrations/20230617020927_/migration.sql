/*
  Warnings:

  - You are about to drop the column `orderCuttingId` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `orderCuttingId` on the `StockEvent` table. All the data in the column will be lost.
  - You are about to drop the `OrderCutting` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `OrderCutting` DROP FOREIGN KEY `OrderCutting_dstLocationId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderCutting` DROP FOREIGN KEY `OrderCutting_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `Plan` DROP FOREIGN KEY `Plan_orderCuttingId_fkey`;

-- DropForeignKey
ALTER TABLE `StockEvent` DROP FOREIGN KEY `StockEvent_orderCuttingId_fkey`;

-- AlterTable
ALTER TABLE `Plan` DROP COLUMN `orderCuttingId`,
    ADD COLUMN `dstOrderProcessId` INTEGER NULL,
    ADD COLUMN `srcOrderProcessId` INTEGER NULL;

-- AlterTable
ALTER TABLE `StockEvent` DROP COLUMN `orderCuttingId`,
    ADD COLUMN `orderProcessId` INTEGER NULL;

-- DropTable
DROP TABLE `OrderCutting`;

-- CreateTable
CREATE TABLE `OrderProcess` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `dstLocationId` INTEGER NOT NULL,
    `srcLocationId` INTEGER NOT NULL,
    `isDirectShipping` BOOLEAN NOT NULL DEFAULT false,
    `srcWantedDate` DATETIME(3) NULL,
    `dstWantedDate` DATETIME(3) NULL,

    UNIQUE INDEX `OrderProcess_orderId_key`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StockEvent` ADD CONSTRAINT `StockEvent_orderProcessId_fkey` FOREIGN KEY (`orderProcessId`) REFERENCES `OrderProcess`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderProcess` ADD CONSTRAINT `OrderProcess_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderProcess` ADD CONSTRAINT `OrderProcess_dstLocationId_fkey` FOREIGN KEY (`dstLocationId`) REFERENCES `Location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderProcess` ADD CONSTRAINT `OrderProcess_srcLocationId_fkey` FOREIGN KEY (`srcLocationId`) REFERENCES `Location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Plan` ADD CONSTRAINT `Plan_srcOrderProcessId_fkey` FOREIGN KEY (`srcOrderProcessId`) REFERENCES `OrderProcess`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Plan` ADD CONSTRAINT `Plan_dstOrderProcessId_fkey` FOREIGN KEY (`dstOrderProcessId`) REFERENCES `OrderProcess`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
