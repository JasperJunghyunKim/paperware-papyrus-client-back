/*
  Warnings:

  - You are about to drop the column `partnerId` on the `Accounted` table. All the data in the column will be lost.
  - Added the required column `companyId` to the `Accounted` table without a default value. This is not possible if the table is not empty.
  - Added the required column `partnerCompanyRegistrationNumber` to the `Accounted` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Accounted` DROP FOREIGN KEY `Accounted_partnerId_fkey`;

-- AlterTable
ALTER TABLE `Accounted` DROP COLUMN `partnerId`,
    ADD COLUMN `companyId` INTEGER NOT NULL,
    ADD COLUMN `partnerCompanyRegistrationNumber` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `ByCard` ADD COLUMN `bankAccountId` INTEGER NULL,
    MODIFY `cardId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Accounted` ADD CONSTRAINT `Accounted_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ByCard` ADD CONSTRAINT `ByCard_bankAccountId_fkey` FOREIGN KEY (`bankAccountId`) REFERENCES `BankAccount`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
