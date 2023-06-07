-- CreateTable
CREATE TABLE `PaperDomain` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Manufacturer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaperGroup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaperType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaperColorGroup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaperColor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaperPattern` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaperCert` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Packaging` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('SKID', 'REAM', 'BOX', 'ROLL') NOT NULL,
    `packA` INTEGER NOT NULL,
    `packB` INTEGER NOT NULL,

    UNIQUE INDEX `Packaging_type_packA_packB_key`(`type`, `packA`, `packB`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `paperDomainId` INTEGER NOT NULL,
    `manufacturerId` INTEGER NOT NULL,
    `paperGroupId` INTEGER NOT NULL,
    `paperTypeId` INTEGER NOT NULL,

    INDEX `Product_paperDomainId_idx`(`paperDomainId`),
    INDEX `Product_manufacturerId_idx`(`manufacturerId`),
    INDEX `Product_paperGroupId_idx`(`paperGroupId`),
    INDEX `Product_paperTypeId_idx`(`paperTypeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Warehouse` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `address` VARCHAR(191) NOT NULL DEFAULT '',
    `companyId` INTEGER NOT NULL,
    `isPublic` BOOLEAN NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Warehouse_companyId_code_key`(`companyId`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Stock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `serial` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NOT NULL,
    `warehouseId` INTEGER NULL,
    `productId` INTEGER NOT NULL,
    `packagingId` INTEGER NOT NULL,
    `grammage` INTEGER NOT NULL,
    `sizeX` INTEGER NOT NULL,
    `sizeY` INTEGER NOT NULL,
    `paperColorGroupId` INTEGER NULL,
    `paperColorId` INTEGER NULL,
    `paperPatternId` INTEGER NULL,
    `paperCertId` INTEGER NULL,
    `cachedQuantity` INTEGER NOT NULL DEFAULT 0,
    `cachedQuantityAvailable` INTEGER NOT NULL DEFAULT 0,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `isSyncPrice` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Stock_serial_key`(`serial`),
    INDEX `Stock_packagingId_idx`(`packagingId`),
    INDEX `Stock_paperColorGroupId_idx`(`paperColorGroupId`),
    INDEX `Stock_paperColorId_idx`(`paperColorId`),
    INDEX `Stock_paperPatternId_idx`(`paperPatternId`),
    INDEX `Stock_paperCertId_idx`(`paperCertId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockPrice` (
    `stockId` INTEGER NOT NULL,
    `officialPriceType` ENUM('NONE', 'MANUAL_NONE', 'MANUAL_DEFAULT', 'RETAIL', 'WHOLESALE') NOT NULL DEFAULT 'NONE',
    `officialPrice` DOUBLE NOT NULL DEFAULT 0,
    `officialPriceUnit` ENUM('WON_PER_TON', 'WON_PER_REAM', 'WON_PER_BOX') NOT NULL,
    `discountType` ENUM('DEFAULT', 'SPECIAL') NOT NULL DEFAULT 'DEFAULT',
    `unitPrice` DOUBLE NOT NULL,
    `discountPrice` DOUBLE NOT NULL DEFAULT 0,
    `unitPriceUnit` ENUM('WON_PER_TON', 'WON_PER_REAM', 'WON_PER_BOX') NOT NULL,

    PRIMARY KEY (`stockId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockEvent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stockId` INTEGER NOT NULL,
    `change` INTEGER NOT NULL,
    `status` ENUM('NORMAL', 'CANCELLED', 'PENDING') NOT NULL,

    UNIQUE INDEX `StockEvent_id_stockId_key`(`id`, `stockId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockGroup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `packagingId` INTEGER NOT NULL,
    `grammage` INTEGER NOT NULL,
    `sizeX` INTEGER NOT NULL,
    `sizeY` INTEGER NOT NULL,
    `paperColorGroupId` INTEGER NULL,
    `paperColorId` INTEGER NULL,
    `paperPatternId` INTEGER NULL,
    `paperCertId` INTEGER NULL,
    `warehouseId` INTEGER NULL,
    `orderStockId` INTEGER NULL,
    `companyId` INTEGER NOT NULL,

    UNIQUE INDEX `StockGroup_productId_packagingId_grammage_sizeX_sizeY_paperC_key`(`productId`, `packagingId`, `grammage`, `sizeX`, `sizeY`, `paperColorGroupId`, `paperColorId`, `paperPatternId`, `paperCertId`, `warehouseId`, `orderStockId`, `companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockGroupEvent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `change` INTEGER NOT NULL,
    `status` ENUM('NORMAL', 'CANCELLED', 'PENDING') NOT NULL,
    `stockGroupId` INTEGER NOT NULL,
    `planId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `companyId` INTEGER NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Company` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `businessName` VARCHAR(191) NOT NULL,
    `companyRegistrationNumber` VARCHAR(191) NULL,
    `phoneNo` VARCHAR(191) NOT NULL DEFAULT '',
    `faxNo` VARCHAR(191) NOT NULL DEFAULT '',
    `email` VARCHAR(191) NOT NULL DEFAULT '',
    `representative` VARCHAR(191) NOT NULL DEFAULT '',
    `invoiceCode` VARCHAR(191) NULL,
    `address` VARCHAR(191) NOT NULL DEFAULT '',
    `managedById` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BusinessRelationship` (
    `srcCompanyId` INTEGER NOT NULL,
    `dstCompanyId` INTEGER NOT NULL,

    PRIMARY KEY (`srcCompanyId`, `dstCompanyId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BusinessRelationshipRequest` (
    `srcCompanyId` INTEGER NOT NULL,
    `dstCompanyId` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED') NOT NULL,
    `memo` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `BusinessRelationshipRequest_srcCompanyId_dstCompanyId_key`(`srcCompanyId`, `dstCompanyId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Location` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `address` VARCHAR(191) NOT NULL DEFAULT '',
    `companyId` INTEGER NOT NULL,
    `isPublic` BOOLEAN NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Location_companyId_code_key`(`companyId`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OfficialPriceMap` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `officialPriceType` ENUM('NONE', 'MANUAL_NONE', 'MANUAL_DEFAULT', 'RETAIL', 'WHOLESALE') NOT NULL,
    `officialPrice` DOUBLE NOT NULL,
    `productId` INTEGER NOT NULL,
    `paperColorGroupId` INTEGER NULL,
    `paperColorId` INTEGER NULL,
    `paperPatternId` INTEGER NULL,
    `paperCertId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderNo` VARCHAR(191) NOT NULL,
    `srcCompanyId` INTEGER NOT NULL,
    `dstCompanyId` INTEGER NOT NULL,
    `status` ENUM('ORDER_PREPARING', 'ORDER_CANCELLED', 'ORDER_REQUESTED', 'ORDER_ACCEPTED', 'ORDER_REJECTED', 'STOCK_OFFER_REQUESTED', 'STOCK_OFFER_ACCEPTED') NOT NULL DEFAULT 'ORDER_PREPARING',
    `isEntrusted` BOOLEAN NOT NULL DEFAULT false,
    `memo` VARCHAR(191) NOT NULL,
    `wantedDate` DATETIME(3) NULL,
    `stockAcceptedCompanyId` INTEGER NULL,
    `isStockRejected` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Order_orderNo_key`(`orderNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderStock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `dstLocationId` INTEGER NULL,
    `planId` INTEGER NULL,
    `stockGroupId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `OrderStock_orderId_key`(`orderId`),
    UNIQUE INDEX `OrderStock_planId_key`(`planId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TradePrice` (
    `orderId` INTEGER NOT NULL,
    `companyId` INTEGER NOT NULL,
    `suppliedPrice` DOUBLE NOT NULL DEFAULT 0,
    `vatPrice` DOUBLE NOT NULL DEFAULT 0,
    `isBookClosed` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`orderId`, `companyId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderStockTradePrice` (
    `orderId` INTEGER NOT NULL,
    `companyId` INTEGER NOT NULL,
    `officialPriceType` ENUM('NONE', 'MANUAL_NONE', 'MANUAL_DEFAULT', 'RETAIL', 'WHOLESALE') NOT NULL DEFAULT 'NONE',
    `officialPrice` DOUBLE NOT NULL DEFAULT 0,
    `officialPriceUnit` ENUM('WON_PER_TON', 'WON_PER_REAM', 'WON_PER_BOX') NOT NULL,
    `discountType` ENUM('DEFAULT', 'SPECIAL') NOT NULL DEFAULT 'DEFAULT',
    `discountUnitPrice` DOUBLE NOT NULL DEFAULT 0,
    `unitPriceUnit` ENUM('WON_PER_TON', 'WON_PER_REAM', 'WON_PER_BOX') NOT NULL,
    `processPrice` DOUBLE NOT NULL DEFAULT 0,

    PRIMARY KEY (`orderId`, `companyId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderStockTradeAltBundle` (
    `orderId` INTEGER NOT NULL,
    `companyId` INTEGER NOT NULL,
    `altSizeX` INTEGER NOT NULL,
    `altSizeY` INTEGER NOT NULL,
    `altQuantity` INTEGER NOT NULL,

    PRIMARY KEY (`orderId`, `companyId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Plan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `planNo` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NOT NULL,
    `status` ENUM('PREPARING', 'PROGRESSING', 'PROGRESSED') NOT NULL DEFAULT 'PREPARING',
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `memo` VARCHAR(191) NOT NULL DEFAULT '',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `targetStockGroupEventId` INTEGER NOT NULL,

    UNIQUE INDEX `Plan_planNo_key`(`planNo`),
    UNIQUE INDEX `Plan_targetStockGroupEventId_key`(`targetStockGroupEventId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Task` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `taskNo` VARCHAR(191) NOT NULL,
    `planId` INTEGER NOT NULL,
    `type` ENUM('CONVERTING', 'GUILLOTINE', 'QUANTITY') NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('PREPARING', 'PROGRESSING', 'PROGRESSED') NOT NULL,
    `parentTaskId` INTEGER NULL,

    UNIQUE INDEX `Task_taskNo_key`(`taskNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaskConverting` (
    `taskId` INTEGER NOT NULL,
    `sizeX` INTEGER NOT NULL,
    `sizeY` INTEGER NOT NULL,
    `memo` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`taskId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaskGuillotine` (
    `taskId` INTEGER NOT NULL,
    `sizeX` INTEGER NOT NULL,
    `sizeY` INTEGER NOT NULL,
    `memo` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`taskId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaskQuantity` (
    `taskId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,

    PRIMARY KEY (`taskId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Shipping` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `shippingNo` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NOT NULL,

    UNIQUE INDEX `Shipping_shippingNo_key`(`shippingNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Invoice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoiceNo` VARCHAR(191) NOT NULL,
    `shippingId` INTEGER NULL,
    `productId` INTEGER NOT NULL,
    `packagingId` INTEGER NOT NULL,
    `grammage` INTEGER NOT NULL,
    `sizeX` INTEGER NOT NULL,
    `sizeY` INTEGER NOT NULL,
    `paperColorGroupId` INTEGER NULL,
    `paperColorId` INTEGER NULL,
    `paperPatternId` INTEGER NULL,
    `paperCertId` INTEGER NULL,
    `quantity` INTEGER NOT NULL,
    `planId` INTEGER NOT NULL,

    UNIQUE INDEX `Invoice_invoiceNo_key`(`invoiceNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_OrderStockToStockEvent` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_OrderStockToStockEvent_AB_unique`(`A`, `B`),
    INDEX `_OrderStockToStockEvent_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_StockEventInPlan` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_StockEventInPlan_AB_unique`(`A`, `B`),
    INDEX `_StockEventInPlan_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_StockEventOutPlan` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_StockEventOutPlan_AB_unique`(`A`, `B`),
    INDEX `_StockEventOutPlan_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_paperDomainId_fkey` FOREIGN KEY (`paperDomainId`) REFERENCES `PaperDomain`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_manufacturerId_fkey` FOREIGN KEY (`manufacturerId`) REFERENCES `Manufacturer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_paperGroupId_fkey` FOREIGN KEY (`paperGroupId`) REFERENCES `PaperGroup`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_paperTypeId_fkey` FOREIGN KEY (`paperTypeId`) REFERENCES `PaperType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Warehouse` ADD CONSTRAINT `Warehouse_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `Warehouse`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_packagingId_fkey` FOREIGN KEY (`packagingId`) REFERENCES `Packaging`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_paperColorGroupId_fkey` FOREIGN KEY (`paperColorGroupId`) REFERENCES `PaperColorGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_paperColorId_fkey` FOREIGN KEY (`paperColorId`) REFERENCES `PaperColor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_paperPatternId_fkey` FOREIGN KEY (`paperPatternId`) REFERENCES `PaperPattern`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_paperCertId_fkey` FOREIGN KEY (`paperCertId`) REFERENCES `PaperCert`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockPrice` ADD CONSTRAINT `StockPrice_stockId_fkey` FOREIGN KEY (`stockId`) REFERENCES `Stock`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockEvent` ADD CONSTRAINT `StockEvent_stockId_fkey` FOREIGN KEY (`stockId`) REFERENCES `Stock`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockGroup` ADD CONSTRAINT `StockGroup_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockGroup` ADD CONSTRAINT `StockGroup_packagingId_fkey` FOREIGN KEY (`packagingId`) REFERENCES `Packaging`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockGroup` ADD CONSTRAINT `StockGroup_paperColorGroupId_fkey` FOREIGN KEY (`paperColorGroupId`) REFERENCES `PaperColorGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockGroup` ADD CONSTRAINT `StockGroup_paperColorId_fkey` FOREIGN KEY (`paperColorId`) REFERENCES `PaperColor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockGroup` ADD CONSTRAINT `StockGroup_paperPatternId_fkey` FOREIGN KEY (`paperPatternId`) REFERENCES `PaperPattern`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockGroup` ADD CONSTRAINT `StockGroup_paperCertId_fkey` FOREIGN KEY (`paperCertId`) REFERENCES `PaperCert`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockGroup` ADD CONSTRAINT `StockGroup_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `Warehouse`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockGroup` ADD CONSTRAINT `StockGroup_orderStockId_fkey` FOREIGN KEY (`orderStockId`) REFERENCES `OrderStock`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockGroup` ADD CONSTRAINT `StockGroup_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockGroupEvent` ADD CONSTRAINT `StockGroupEvent_stockGroupId_fkey` FOREIGN KEY (`stockGroupId`) REFERENCES `StockGroup`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Company` ADD CONSTRAINT `Company_managedById_fkey` FOREIGN KEY (`managedById`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BusinessRelationship` ADD CONSTRAINT `BusinessRelationship_srcCompanyId_fkey` FOREIGN KEY (`srcCompanyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BusinessRelationship` ADD CONSTRAINT `BusinessRelationship_dstCompanyId_fkey` FOREIGN KEY (`dstCompanyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BusinessRelationshipRequest` ADD CONSTRAINT `BusinessRelationshipRequest_srcCompanyId_fkey` FOREIGN KEY (`srcCompanyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BusinessRelationshipRequest` ADD CONSTRAINT `BusinessRelationshipRequest_dstCompanyId_fkey` FOREIGN KEY (`dstCompanyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Location` ADD CONSTRAINT `Location_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OfficialPriceMap` ADD CONSTRAINT `OfficialPriceMap_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OfficialPriceMap` ADD CONSTRAINT `OfficialPriceMap_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OfficialPriceMap` ADD CONSTRAINT `OfficialPriceMap_paperColorGroupId_fkey` FOREIGN KEY (`paperColorGroupId`) REFERENCES `PaperColorGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OfficialPriceMap` ADD CONSTRAINT `OfficialPriceMap_paperColorId_fkey` FOREIGN KEY (`paperColorId`) REFERENCES `PaperColor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OfficialPriceMap` ADD CONSTRAINT `OfficialPriceMap_paperPatternId_fkey` FOREIGN KEY (`paperPatternId`) REFERENCES `PaperPattern`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OfficialPriceMap` ADD CONSTRAINT `OfficialPriceMap_paperCertId_fkey` FOREIGN KEY (`paperCertId`) REFERENCES `PaperCert`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_srcCompanyId_fkey` FOREIGN KEY (`srcCompanyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_dstCompanyId_fkey` FOREIGN KEY (`dstCompanyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderStock` ADD CONSTRAINT `OrderStock_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderStock` ADD CONSTRAINT `OrderStock_dstLocationId_fkey` FOREIGN KEY (`dstLocationId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderStock` ADD CONSTRAINT `OrderStock_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `Plan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderStock` ADD CONSTRAINT `OrderStock_stockGroupId_fkey` FOREIGN KEY (`stockGroupId`) REFERENCES `StockGroup`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TradePrice` ADD CONSTRAINT `TradePrice_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TradePrice` ADD CONSTRAINT `TradePrice_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderStockTradePrice` ADD CONSTRAINT `OrderStockTradePrice_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderStockTradePrice` ADD CONSTRAINT `OrderStockTradePrice_orderId_companyId_fkey` FOREIGN KEY (`orderId`, `companyId`) REFERENCES `TradePrice`(`orderId`, `companyId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderStockTradeAltBundle` ADD CONSTRAINT `OrderStockTradeAltBundle_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Plan` ADD CONSTRAINT `Plan_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Plan` ADD CONSTRAINT `Plan_targetStockGroupEventId_fkey` FOREIGN KEY (`targetStockGroupEventId`) REFERENCES `StockGroupEvent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `Plan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_parentTaskId_fkey` FOREIGN KEY (`parentTaskId`) REFERENCES `Task`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskConverting` ADD CONSTRAINT `TaskConverting_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `Task`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskGuillotine` ADD CONSTRAINT `TaskGuillotine_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `Task`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskQuantity` ADD CONSTRAINT `TaskQuantity_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `Task`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shipping` ADD CONSTRAINT `Shipping_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_shippingId_fkey` FOREIGN KEY (`shippingId`) REFERENCES `Shipping`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_packagingId_fkey` FOREIGN KEY (`packagingId`) REFERENCES `Packaging`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_paperColorGroupId_fkey` FOREIGN KEY (`paperColorGroupId`) REFERENCES `PaperColorGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_paperColorId_fkey` FOREIGN KEY (`paperColorId`) REFERENCES `PaperColor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_paperPatternId_fkey` FOREIGN KEY (`paperPatternId`) REFERENCES `PaperPattern`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_paperCertId_fkey` FOREIGN KEY (`paperCertId`) REFERENCES `PaperCert`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `Plan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_OrderStockToStockEvent` ADD CONSTRAINT `_OrderStockToStockEvent_A_fkey` FOREIGN KEY (`A`) REFERENCES `OrderStock`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_OrderStockToStockEvent` ADD CONSTRAINT `_OrderStockToStockEvent_B_fkey` FOREIGN KEY (`B`) REFERENCES `StockEvent`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_StockEventInPlan` ADD CONSTRAINT `_StockEventInPlan_A_fkey` FOREIGN KEY (`A`) REFERENCES `Plan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_StockEventInPlan` ADD CONSTRAINT `_StockEventInPlan_B_fkey` FOREIGN KEY (`B`) REFERENCES `StockEvent`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_StockEventOutPlan` ADD CONSTRAINT `_StockEventOutPlan_A_fkey` FOREIGN KEY (`A`) REFERENCES `Plan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_StockEventOutPlan` ADD CONSTRAINT `_StockEventOutPlan_B_fkey` FOREIGN KEY (`B`) REFERENCES `StockEvent`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
