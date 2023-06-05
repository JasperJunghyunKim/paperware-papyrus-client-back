/*
  Warnings:

  - The values [WITHDRAW] on the enum `Order_orderType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `depositEventId` on the `OrderDeposit` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `OrderDeposit` DROP FOREIGN KEY `OrderDeposit_depositEventId_fkey`;

-- AlterTable
ALTER TABLE `DepositEvent` ADD COLUMN `orderDepositId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Order` MODIFY `orderType` ENUM('NORMAL', 'DEPOSIT') NOT NULL;

-- AlterTable
ALTER TABLE `OrderDeposit` DROP COLUMN `depositEventId`;

-- AddForeignKey
ALTER TABLE `DepositEvent` ADD CONSTRAINT `DepositEvent_orderDepositId_fkey` FOREIGN KEY (`orderDepositId`) REFERENCES `OrderDeposit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
