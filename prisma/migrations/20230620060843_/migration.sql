/*
  Warnings:

  - You are about to drop the column `dstOrderProcessId` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `srcOrderProcessId` on the `Plan` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Plan` DROP FOREIGN KEY `Plan_dstOrderProcessId_fkey`;

-- DropForeignKey
ALTER TABLE `Plan` DROP FOREIGN KEY `Plan_srcOrderProcessId_fkey`;

-- AlterTable
ALTER TABLE `Plan` DROP COLUMN `dstOrderProcessId`,
    DROP COLUMN `srcOrderProcessId`,
    ADD COLUMN `orderProcessId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Plan` ADD CONSTRAINT `Plan_orderProcessId_fkey` FOREIGN KEY (`orderProcessId`) REFERENCES `OrderProcess`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
