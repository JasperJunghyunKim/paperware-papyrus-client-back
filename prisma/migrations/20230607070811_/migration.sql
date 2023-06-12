-- CreateTable
CREATE TABLE `OrderDepositTradePrice` (
    `orderId` INTEGER NOT NULL,
    `companyId` INTEGER NOT NULL,
    `officialPriceType` ENUM('NONE', 'MANUAL_NONE', 'RETAIL', 'WHOLESALE') NOT NULL DEFAULT 'NONE',
    `officialPrice` DOUBLE NOT NULL DEFAULT 0,
    `officialPriceUnit` ENUM('WON_PER_TON', 'WON_PER_REAM', 'WON_PER_BOX') NOT NULL,
    `discountType` ENUM('NONE', 'MANUAL_NONE', 'DEFAULT', 'SPECIAL') NOT NULL DEFAULT 'DEFAULT',
    `discountPrice` DOUBLE NOT NULL DEFAULT 0,
    `unitPrice` DOUBLE NOT NULL DEFAULT 0,
    `unitPriceUnit` ENUM('WON_PER_TON', 'WON_PER_REAM', 'WON_PER_BOX') NOT NULL,
    `processPrice` DOUBLE NOT NULL DEFAULT 0,

    PRIMARY KEY (`orderId`, `companyId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderDepositTradeAltBundle` (
    `orderId` INTEGER NOT NULL,
    `companyId` INTEGER NOT NULL,
    `altSizeX` INTEGER NOT NULL,
    `altSizeY` INTEGER NOT NULL,
    `altQuantity` INTEGER NOT NULL,

    PRIMARY KEY (`orderId`, `companyId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrderDepositTradePrice` ADD CONSTRAINT `OrderDepositTradePrice_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDepositTradePrice` ADD CONSTRAINT `OrderDepositTradePrice_orderId_companyId_fkey` FOREIGN KEY (`orderId`, `companyId`) REFERENCES `TradePrice`(`orderId`, `companyId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDepositTradeAltBundle` ADD CONSTRAINT `OrderDepositTradeAltBundle_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDepositTradeAltBundle` ADD CONSTRAINT `OrderDepositTradeAltBundle_orderId_companyId_fkey` FOREIGN KEY (`orderId`, `companyId`) REFERENCES `OrderDepositTradePrice`(`orderId`, `companyId`) ON DELETE RESTRICT ON UPDATE CASCADE;
