/*
  Warnings:

  - You are about to drop the column `partnerId` on the `DiscountRateCondition` table. All the data in the column will be lost.
  - Added the required column `companyId` to the `DiscountRateCondition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `partnerCompanyRegistrationNumber` to the `DiscountRateCondition` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `DiscountRateCondition` DROP FOREIGN KEY `DiscountRateCondition_partnerId_fkey`;

-- AlterTable
ALTER TABLE `DiscountRateCondition` DROP COLUMN `partnerId`,
    ADD COLUMN `companyId` INTEGER NOT NULL,
    ADD COLUMN `partnerCompanyRegistrationNumber` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `DiscountRateCondition` ADD CONSTRAINT `DiscountRateCondition_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
