/*
  Warnings:

  - You are about to drop the column `partnerId` on the `Deposit` table. All the data in the column will be lost.
  - Added the required column `companyId` to the `Deposit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `partnerCompanyRegistrationNumber` to the `Deposit` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Deposit` DROP FOREIGN KEY `Deposit_partnerId_fkey`;

-- AlterTable
ALTER TABLE `Deposit` DROP COLUMN `partnerId`,
    ADD COLUMN `companyId` INTEGER NOT NULL,
    ADD COLUMN `partnerCompanyRegistrationNumber` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Deposit` ADD CONSTRAINT `Deposit_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
