-- CreateTable
CREATE TABLE `TempInvoiceCode` (
    `invoiceCode` VARCHAR(191) NOT NULL,
    `number` INTEGER NOT NULL,
    `maxPercent` DOUBLE NOT NULL,

    UNIQUE INDEX `TempInvoiceCode_invoiceCode_key`(`invoiceCode`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
