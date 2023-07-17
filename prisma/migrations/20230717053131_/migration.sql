/*
  Warnings:

  - You are about to drop the column `srcEmail` on the `TaxInvoice` table. All the data in the column will be lost.
  - You are about to drop the column `srcEmail2` on the `TaxInvoice` table. All the data in the column will be lost.
  - You are about to drop the column `srcEmailName` on the `TaxInvoice` table. All the data in the column will be lost.
  - You are about to drop the column `srcEmailName2` on the `TaxInvoice` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `TaxInvoice` DROP COLUMN `srcEmail`,
    DROP COLUMN `srcEmail2`,
    DROP COLUMN `srcEmailName`,
    DROP COLUMN `srcEmailName2`;

-- CreateTable
CREATE TABLE `_PartnerTaxManagerToTaxInvoice` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_PartnerTaxManagerToTaxInvoice_AB_unique`(`A`, `B`),
    INDEX `_PartnerTaxManagerToTaxInvoice_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_PartnerTaxManagerToTaxInvoice` ADD CONSTRAINT `_PartnerTaxManagerToTaxInvoice_A_fkey` FOREIGN KEY (`A`) REFERENCES `PartnerTaxManager`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PartnerTaxManagerToTaxInvoice` ADD CONSTRAINT `_PartnerTaxManagerToTaxInvoice_B_fkey` FOREIGN KEY (`B`) REFERENCES `TaxInvoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
