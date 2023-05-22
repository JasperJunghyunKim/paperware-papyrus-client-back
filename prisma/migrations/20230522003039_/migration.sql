-- AlterTable
ALTER TABLE `StockGroup` ADD COLUMN `isArrived` BOOLEAN NULL;

-- CreateTable
CREATE TABLE `StockGroupPrice` (
    `stockGruopId` INTEGER NOT NULL,
    `officialPriceType` ENUM('NONE', 'MANUAL_NONE', 'RETAIL', 'WHOLESALE') NOT NULL DEFAULT 'NONE',
    `officialPrice` DOUBLE NOT NULL DEFAULT 0,
    `officialPriceUnit` ENUM('WON_PER_TON', 'WON_PER_REAM', 'WON_PER_BOX') NOT NULL,
    `discountType` ENUM('NONE', 'MANUAL_NONE', 'DEFAULT', 'SPECIAL') NOT NULL DEFAULT 'DEFAULT',
    `unitPrice` DOUBLE NOT NULL,
    `discountPrice` DOUBLE NOT NULL DEFAULT 0,
    `unitPriceUnit` ENUM('WON_PER_TON', 'WON_PER_REAM', 'WON_PER_BOX') NOT NULL,

    PRIMARY KEY (`stockGruopId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StockGroupPrice` ADD CONSTRAINT `StockGroupPrice_stockGruopId_fkey` FOREIGN KEY (`stockGruopId`) REFERENCES `StockGroup`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
