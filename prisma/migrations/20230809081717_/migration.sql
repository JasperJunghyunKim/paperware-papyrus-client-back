/*
  Warnings:

  - You are about to drop the column `companyId` on the `OrderReturn` table. All the data in the column will be lost.
  - You are about to drop the column `locationId` on the `OrderReturn` table. All the data in the column will be lost.
  - You are about to drop the column `planId` on the `OrderReturn` table. All the data in the column will be lost.
  - You are about to drop the column `warehouseId` on the `OrderReturn` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `OrderReturn` DROP FOREIGN KEY `OrderReturn_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderReturn` DROP FOREIGN KEY `OrderReturn_locationId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderReturn` DROP FOREIGN KEY `OrderReturn_warehouseId_fkey`;

-- AlterTable
ALTER TABLE `OrderReturn` DROP COLUMN `companyId`,
    DROP COLUMN `locationId`,
    DROP COLUMN `planId`,
    DROP COLUMN `warehouseId`;

-- AddForeignKey
ALTER TABLE `OrderReturn` ADD CONSTRAINT `OrderReturn_dstLocationId_fkey` FOREIGN KEY (`dstLocationId`) REFERENCES `Location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
