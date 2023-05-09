-- DropIndex
DROP INDEX `Company_companyRegistrationNumber_key` ON `Company`;

-- AlterTable
ALTER TABLE `Company` ADD COLUMN `address` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `invoiceCode` VARCHAR(191) NULL,
    ADD COLUMN `representative` VARCHAR(191) NOT NULL DEFAULT '';
