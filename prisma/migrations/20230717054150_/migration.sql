/*
  Warnings:

  - You are about to drop the `_PartnerTaxManagerToTaxInvoice` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_PartnerTaxManagerToTaxInvoice` DROP FOREIGN KEY `_PartnerTaxManagerToTaxInvoice_A_fkey`;

-- DropForeignKey
ALTER TABLE `_PartnerTaxManagerToTaxInvoice` DROP FOREIGN KEY `_PartnerTaxManagerToTaxInvoice_B_fkey`;

-- AlterTable
ALTER TABLE `TaxInvoice` ADD COLUMN `srcEmail` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `srcEmail2` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `srcEmailName` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `srcEmailName2` VARCHAR(191) NOT NULL DEFAULT '';

-- DropTable
DROP TABLE `_PartnerTaxManagerToTaxInvoice`;
