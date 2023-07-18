/*
  Warnings:

  - You are about to drop the column `dstDepositEventId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `srcDepositEventId` on the `Order` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[targetOrderId]` on the table `DepositEvent` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Order` DROP FOREIGN KEY `Order_dstDepositEventId_fkey`;

-- DropForeignKey
ALTER TABLE `Order` DROP FOREIGN KEY `Order_srcDepositEventId_fkey`;

-- AlterTable
ALTER TABLE `DepositEvent` ADD COLUMN `targetOrderId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Order` DROP COLUMN `dstDepositEventId`,
    DROP COLUMN `srcDepositEventId`,
    ADD COLUMN `depositEventId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `DepositEvent_targetOrderId_key` ON `DepositEvent`(`targetOrderId`);

-- AddForeignKey
ALTER TABLE `DepositEvent` ADD CONSTRAINT `DepositEvent_targetOrderId_fkey` FOREIGN KEY (`targetOrderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
