-- CreateTable
CREATE TABLE `TaxInvoice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `companyRegistrationNumber` VARCHAR(191) NOT NULL,
    `invoicerMgtKey` VARCHAR(191) NOT NULL,
    `writeDate` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TaxInvoice_invoicerMgtKey_key`(`invoicerMgtKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TaxInvoice` ADD CONSTRAINT `TaxInvoice_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
