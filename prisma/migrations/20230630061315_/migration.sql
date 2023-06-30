/*
  Warnings:

  - You are about to drop the column `stockAcceptedCompanyId` on the `Order` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Order` DROP FOREIGN KEY `Order_stockAcceptedCompanyId_fkey`;

-- AlterTable
ALTER TABLE `Order` DROP COLUMN `stockAcceptedCompanyId`,
    ADD COLUMN `acceptedCompanyId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_acceptedCompanyId_fkey` FOREIGN KEY (`acceptedCompanyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
