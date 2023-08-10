-- CreateTable
CREATE TABLE `PaperDomain` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `isDiscontinued` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Manufacturer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `isDiscontinued` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaperGroup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `isDiscontinued` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaperType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `isDiscontinued` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaperColorGroup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `isDiscontinued` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaperColor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `isDiscontinued` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaperPattern` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `isDiscontinued` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaperCert` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `isDiscontinued` BOOLEAN NOT NULL DEFAULT false,

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
    `isDiscontinued` BOOLEAN NOT NULL DEFAULT false,

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
    `address` VARCHAR(500) NOT NULL DEFAULT '',
    `companyId` INTEGER NOT NULL,
    `isPublic` BOOLEAN NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Stock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `serial` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NOT NULL,
    `warehouseId` INTEGER NULL,
    `planId` INTEGER NULL,
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
    `isSyncPrice` BOOLEAN NOT NULL DEFAULT false,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `initialPlanId` INTEGER NOT NULL,

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
    `officialPriceType` ENUM('NONE', 'MANUAL_NONE', 'RETAIL', 'WHOLESALE') NOT NULL DEFAULT 'NONE',
    `officialPrice` DOUBLE NOT NULL DEFAULT 0,
    `officialPriceUnit` ENUM('WON_PER_TON', 'WON_PER_REAM', 'WON_PER_BOX') NOT NULL,
    `discountType` ENUM('NONE', 'MANUAL_NONE', 'DEFAULT', 'SPECIAL') NOT NULL DEFAULT 'DEFAULT',
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
    `planId` INTEGER NOT NULL,
    `orderProcessId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `useRemainder` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phoneNo` VARCHAR(191) NOT NULL DEFAULT '',
    `email` VARCHAR(191) NULL,
    `birthDate` DATETIME(3) NULL,
    `companyId` INTEGER NULL,
    `isActivated` BOOLEAN NOT NULL DEFAULT true,
    `isAdmin` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastLoginTime` DATETIME(3) NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserFindPasswordAuth` (
    `userId` INTEGER NOT NULL,
    `authKey` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `UserFindPasswordAuth_userId_key`(`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Company` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyType` ENUM('DISTRIBUTOR', 'MANUFACTURER', 'PRACTICAL', 'ETC') NOT NULL DEFAULT 'ETC',
    `businessName` VARCHAR(191) NOT NULL,
    `companyRegistrationNumber` VARCHAR(191) NOT NULL,
    `corporateRegistrationNumber` VARCHAR(191) NULL,
    `phoneNo` VARCHAR(191) NOT NULL DEFAULT '',
    `faxNo` VARCHAR(191) NOT NULL DEFAULT '',
    `representative` VARCHAR(191) NOT NULL DEFAULT '',
    `invoiceCode` VARCHAR(191) NOT NULL,
    `bizType` VARCHAR(191) NOT NULL DEFAULT '',
    `bizItem` VARCHAR(191) NOT NULL DEFAULT '',
    `address` VARCHAR(500) NOT NULL DEFAULT '',
    `popbillId` VARCHAR(191) NULL,
    `managedById` INTEGER NULL,
    `startDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `memo` VARCHAR(191) NOT NULL DEFAULT '',
    `isActivated` BOOLEAN NOT NULL DEFAULT true,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BusinessRelationship` (
    `srcCompanyId` INTEGER NOT NULL,
    `dstCompanyId` INTEGER NOT NULL,
    `isActivated` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`srcCompanyId`, `dstCompanyId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BusinessRelationshipRequest` (
    `srcCompanyId` INTEGER NOT NULL,
    `dstCompanyId` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED') NOT NULL,
    `isPurchase` BOOLEAN NOT NULL DEFAULT false,
    `isSales` BOOLEAN NOT NULL DEFAULT false,
    `memo` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `BusinessRelationshipRequest_srcCompanyId_dstCompanyId_key`(`srcCompanyId`, `dstCompanyId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Location` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `address` VARCHAR(500) NOT NULL DEFAULT '',
    `companyId` INTEGER NOT NULL,
    `isPublic` BOOLEAN NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `phoneNo` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OfficialPriceCondition` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `grammage` INTEGER NOT NULL,
    `sizeX` INTEGER NOT NULL,
    `sizeY` INTEGER NOT NULL,
    `paperColorGroupId` INTEGER NULL,
    `paperColorId` INTEGER NULL,
    `paperPatternId` INTEGER NULL,
    `paperCertId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OfficialPriceMap` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `officialPriceConditionId` INTEGER NOT NULL,
    `companyId` INTEGER NOT NULL,
    `officialPriceMapType` ENUM('WHOLESALE', 'RETAIL') NOT NULL,
    `officialPrice` DOUBLE NOT NULL,
    `officialPriceUnit` ENUM('WON_PER_TON', 'WON_PER_REAM', 'WON_PER_BOX') NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderType` ENUM('NORMAL', 'DEPOSIT', 'OUTSOURCE_PROCESS', 'ETC', 'REFUND', 'RETURN') NOT NULL,
    `orderNo` VARCHAR(191) NOT NULL,
    `orderDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `srcCompanyId` INTEGER NOT NULL,
    `dstCompanyId` INTEGER NOT NULL,
    `status` ENUM('ORDER_PREPARING', 'ORDER_REQUESTED', 'ORDER_REJECTED', 'OFFER_PREPARING', 'OFFER_REQUESTED', 'OFFER_REJECTED', 'ACCEPTED', 'ORDER_DELETED', 'OFFER_DELETED', 'CANCELLED') NOT NULL DEFAULT 'ORDER_PREPARING',
    `isEntrusted` BOOLEAN NOT NULL DEFAULT false,
    `memo` VARCHAR(191) NOT NULL,
    `ordererName` VARCHAR(191) NOT NULL DEFAULT '',
    `acceptedCompanyId` INTEGER NULL,
    `isStockRejected` BOOLEAN NOT NULL DEFAULT false,
    `taxInvoiceId` INTEGER NULL,
    `revision` INTEGER NOT NULL DEFAULT 0,
    `depositEventId` INTEGER NULL,
    `createdCompanyId` INTEGER NOT NULL,

    UNIQUE INDEX `Order_orderNo_key`(`orderNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `type` ENUM('CREATE', 'ACCEPT', 'PLAN_START', 'PLAN_CANCEL', 'ORDER_CANCEL', 'OFFER_REQUEST', 'OFFER_REQUEST_CANCEL', 'OFFER_REQUEST_REJECT', 'ORDER_REQUEST', 'ORDER_REQUEST_CANCEL', 'ORDER_REQUEST_REJECT') NOT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderStock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `dstLocationId` INTEGER NULL,
    `isDirectShipping` BOOLEAN NOT NULL DEFAULT false,
    `wantedDate` DATETIME(3) NULL,
    `companyId` INTEGER NOT NULL,
    `planId` INTEGER NULL,
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
    `quantity` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `OrderStock_orderId_key`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderProcess` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `dstLocationId` INTEGER NOT NULL,
    `srcLocationId` INTEGER NOT NULL,
    `isSrcDirectShipping` BOOLEAN NOT NULL DEFAULT false,
    `isDstDirectShipping` BOOLEAN NOT NULL DEFAULT false,
    `srcWantedDate` DATETIME(3) NULL,
    `dstWantedDate` DATETIME(3) NULL,
    `companyId` INTEGER NOT NULL,
    `planId` INTEGER NULL,
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
    `quantity` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `OrderProcess_orderId_key`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderEtc` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `item` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `OrderEtc_orderId_key`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderRefund` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `originOrderNo` VARCHAR(191) NULL,
    `item` VARCHAR(191) NOT NULL DEFAULT '',

    UNIQUE INDEX `OrderRefund_orderId_key`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderReturn` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `originOrderNo` VARCHAR(191) NULL,
    `dstLocationId` INTEGER NOT NULL,
    `wantedDate` DATETIME(3) NOT NULL,
    `productId` INTEGER NOT NULL,
    `packagingId` INTEGER NOT NULL,
    `grammage` INTEGER NOT NULL,
    `sizeX` INTEGER NOT NULL,
    `sizeY` INTEGER NOT NULL,
    `paperColorGroupId` INTEGER NULL,
    `paperColorId` INTEGER NULL,
    `paperPatternId` INTEGER NULL,
    `paperCertId` INTEGER NULL,
    `quantity` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `OrderReturn_orderId_key`(`orderId`),
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
    `type` ENUM('INHOUSE_CREATE', 'INHOUSE_MODIFY', 'INHOUSE_RELOCATION', 'INHOUSE_PROCESS', 'INHOUSE_STOCK_QUANTITY_CHANGE', 'TRADE_NORMAL_SELLER', 'TRADE_NORMAL_BUYER', 'TRADE_WITHDRAW_SELLER', 'TRADE_WITHDRAW_BUYER', 'TRADE_OUTSOURCE_PROCESS_SELLER', 'TRADE_OUTSOURCE_PROCESS_BUYER', 'RETURN_SELLER', 'RETURN_BUYER') NOT NULL,
    `companyId` INTEGER NOT NULL,
    `status` ENUM('PREPARING', 'PROGRESSING', 'PROGRESSED', 'CANCELLED') NOT NULL DEFAULT 'PREPARING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `assignStockEventId` INTEGER NULL,
    `orderStockId` INTEGER NULL,
    `orderProcessId` INTEGER NULL,
    `orderReturnId` INTEGER NULL,

    UNIQUE INDEX `Plan_planNo_key`(`planNo`),
    UNIQUE INDEX `Plan_assignStockEventId_key`(`assignStockEventId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlanShipping` (
    `planId` INTEGER NOT NULL,
    `dstLocationId` INTEGER NOT NULL,
    `isDirectShipping` BOOLEAN NOT NULL DEFAULT false,
    `wantedDate` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PlanShipping_planId_key`(`planId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Task` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `taskNo` VARCHAR(191) NOT NULL,
    `planId` INTEGER NOT NULL,
    `type` ENUM('CONVERTING', 'GUILLOTINE', 'RELEASE') NOT NULL,
    `status` ENUM('PREPARING', 'PROGRESSING', 'PROGRESSED', 'CANCELLED') NOT NULL,
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
    `memo` VARCHAR(191) NOT NULL,
    `invoiceId` INTEGER NULL,

    PRIMARY KEY (`taskId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Shipping` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('INHOUSE', 'OUTSOURCE', 'PARTNER_PICKUP') NOT NULL,
    `shippingNo` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL DEFAULT 0,
    `companyId` INTEGER NOT NULL,
    `status` ENUM('PREPARING', 'PROGRESSING', 'DONE') NOT NULL DEFAULT 'PREPARING',
    `managerId` INTEGER NULL,
    `companyRegistrationNumber` VARCHAR(191) NULL,
    `memo` VARCHAR(191) NOT NULL DEFAULT '',
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdById` INTEGER NOT NULL,

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
    `invoiceStatus` ENUM('WAIT_LOADING', 'WAIT_SHIPPING', 'ON_SHIPPING', 'DONE_SHIPPING', 'CANCELLED') NOT NULL DEFAULT 'WAIT_LOADING',

    UNIQUE INDEX `Invoice_invoiceNo_key`(`invoiceNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaxInvoice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ntsconfirmNum` VARCHAR(191) NULL,
    `issuedDate` DATETIME(3) NULL,
    `sendedDate` DATETIME(3) NULL,
    `purposeType` ENUM('RECEIPT', 'CHARGE') NOT NULL,
    `invoicerMgtKey` VARCHAR(191) NOT NULL,
    `writeDate` DATETIME(3) NOT NULL,
    `cash` INTEGER NULL,
    `check` INTEGER NULL,
    `note` INTEGER NULL,
    `credit` INTEGER NULL,
    `companyId` INTEGER NOT NULL,
    `dstCompanyRegistrationNumber` VARCHAR(191) NOT NULL,
    `dstCompanyName` VARCHAR(191) NOT NULL,
    `dstCompanyRepresentative` VARCHAR(191) NOT NULL,
    `dstCompanyAddress` VARCHAR(191) NOT NULL,
    `dstCompanyBizType` VARCHAR(191) NOT NULL,
    `dstCompanyBizItem` VARCHAR(191) NOT NULL,
    `dstEmail` VARCHAR(191) NOT NULL DEFAULT '',
    `srcCompanyRegistrationNumber` VARCHAR(191) NOT NULL,
    `srcCompanyName` VARCHAR(191) NOT NULL,
    `srcCompanyRepresentative` VARCHAR(191) NOT NULL,
    `srcCompanyAddress` VARCHAR(191) NOT NULL,
    `srcCompanyBizType` VARCHAR(191) NOT NULL,
    `srcCompanyBizItem` VARCHAR(191) NOT NULL,
    `srcEmailName` VARCHAR(191) NOT NULL DEFAULT '',
    `srcEmail` VARCHAR(191) NOT NULL DEFAULT '',
    `srcEmailName2` VARCHAR(191) NOT NULL DEFAULT '',
    `srcEmail2` VARCHAR(191) NOT NULL DEFAULT '',
    `memo` VARCHAR(191) NOT NULL DEFAULT '',
    `status` ENUM('PREPARING', 'ON_ISSUE', 'ISSUED', 'ISSUE_FAILED', 'ON_SEND', 'SENDED', 'SEND_FAILED') NOT NULL DEFAULT 'PREPARING',
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `TaxInvoice_ntsconfirmNum_key`(`ntsconfirmNum`),
    UNIQUE INDEX `TaxInvoice_invoicerMgtKey_key`(`invoicerMgtKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BankAccount` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `bank` ENUM('KAKAO_BANK', 'KOOKMIN_BANK', 'KEB_HANA_BANK', 'NH_BANK', 'SHINHAN_BANK', 'IBK', 'WOORI_BANK', 'CITI_BANK_KOREA', 'HANA_BANK', 'SC_FIRST_BANK', 'KYONGNAM_BANK', 'KWANGJU_BANK', 'DAEGU_BANK', 'DEUTSCHE_BANK', 'BANK_OF_AMERICA', 'BUSAN_BANK', 'NACF', 'SAVINGS_BANK', 'NACCSF', 'SUHYUP_BANK', 'NACUFOK', 'POST_OFFICE', 'JEONBUK_BANK', 'JEJU_BANK', 'K_BANK', 'TOS_BANK') NOT NULL,
    `accountName` VARCHAR(30) NOT NULL,
    `accountType` ENUM('DEPOSIT') NOT NULL,
    `accountNumber` VARCHAR(30) NOT NULL,
    `accountHolder` VARCHAR(50) NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Card` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `cardName` VARCHAR(50) NOT NULL,
    `cardCompany` ENUM('BC_CARD', 'KB_CARD', 'SAMSUNG_CARD', 'SHINHAN_CARD', 'WOORI_CARD', 'HANA_CARD', 'LOTTE_CARD', 'HYUNDAI_CARD', 'NH_CARD') NOT NULL,
    `cardNumber` VARCHAR(50) NOT NULL,
    `cardHolder` VARCHAR(50) NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Security` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `securityType` ENUM('PROMISSORY_NOTE', 'ELECTRONIC_NOTE', 'ELECTRONIC_BOND', 'PERSONAL_CHECK', 'DEMAND_DRAFT', 'HOUSEHOLD_CHECK', 'STATIONERY_NOTE', 'ETC') NOT NULL,
    `securitySerial` VARCHAR(191) NOT NULL,
    `securityAmount` DOUBLE NOT NULL,
    `securityStatus` ENUM('NONE', 'NORMAL_PAYMENT', 'DISCOUNT_PAYMENT', 'INSOLVENCY', 'LOST', 'SAFEKEEPING') NOT NULL DEFAULT 'NONE',
    `drawedDate` DATETIME(3) NULL,
    `drawedBank` ENUM('KAKAO_BANK', 'KOOKMIN_BANK', 'KEB_HANA_BANK', 'NH_BANK', 'SHINHAN_BANK', 'IBK', 'WOORI_BANK', 'CITI_BANK_KOREA', 'HANA_BANK', 'SC_FIRST_BANK', 'KYONGNAM_BANK', 'KWANGJU_BANK', 'DAEGU_BANK', 'DEUTSCHE_BANK', 'BANK_OF_AMERICA', 'BUSAN_BANK', 'NACF', 'SAVINGS_BANK', 'NACCSF', 'SUHYUP_BANK', 'NACUFOK', 'POST_OFFICE', 'JEONBUK_BANK', 'JEJU_BANK', 'K_BANK', 'TOS_BANK') NULL,
    `drawedBankBranch` VARCHAR(191) NULL,
    `drawedRegion` VARCHAR(191) NULL,
    `drawer` VARCHAR(191) NULL,
    `maturedDate` DATETIME(3) NULL,
    `payingBank` ENUM('KAKAO_BANK', 'KOOKMIN_BANK', 'KEB_HANA_BANK', 'NH_BANK', 'SHINHAN_BANK', 'IBK', 'WOORI_BANK', 'CITI_BANK_KOREA', 'HANA_BANK', 'SC_FIRST_BANK', 'KYONGNAM_BANK', 'KWANGJU_BANK', 'DAEGU_BANK', 'DEUTSCHE_BANK', 'BANK_OF_AMERICA', 'BUSAN_BANK', 'NACF', 'SAVINGS_BANK', 'NACCSF', 'SUHYUP_BANK', 'NACUFOK', 'POST_OFFICE', 'JEONBUK_BANK', 'JEJU_BANK', 'K_BANK', 'TOS_BANK') NULL,
    `payingBankBranch` VARCHAR(191) NULL,
    `payer` VARCHAR(191) NULL,
    `memo` VARCHAR(500) NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `companyId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Partner` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `companyRegistrationNumber` VARCHAR(191) NOT NULL,
    `partnerNickName` VARCHAR(100) NOT NULL,
    `creditLimit` INTEGER NOT NULL DEFAULT 0,
    `memo` VARCHAR(500) NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Partner_companyId_companyRegistrationNumber_key`(`companyId`, `companyRegistrationNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PartnerTaxManager` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `partnerId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phoneNo` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Accounted` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `companyRegistrationNumber` VARCHAR(191) NOT NULL,
    `accountedType` ENUM('PAID', 'COLLECTED') NOT NULL,
    `accountedMethod` ENUM('ACCOUNT_TRANSFER', 'PROMISSORY_NOTE', 'CARD_PAYMENT', 'CASH', 'OFFSET', 'ETC') NOT NULL,
    `accountedDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `accountedSubject` ENUM('ACCOUNTS_RECEIVABLE', 'UNPAID', 'ADVANCES', 'MISCELLANEOUS_INCOME', 'PRODUCT_SALES', 'ETC') NOT NULL,
    `memo` VARCHAR(500) NOT NULL DEFAULT '',
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ByCash` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `amount` INTEGER NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `accountedId` INTEGER NOT NULL,

    UNIQUE INDEX `ByCash_accountedId_key`(`accountedId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ByEtc` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `amount` INTEGER NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `accountedId` INTEGER NOT NULL,

    UNIQUE INDEX `ByEtc_accountedId_key`(`accountedId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ByBankAccount` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `amount` INTEGER NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `accountedId` INTEGER NOT NULL,
    `bankAccountId` INTEGER NOT NULL,

    UNIQUE INDEX `ByBankAccount_accountedId_key`(`accountedId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ByCard` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cardAmount` INTEGER NOT NULL,
    `vatPrice` INTEGER NOT NULL,
    `amount` INTEGER NOT NULL,
    `isCharge` BOOLEAN NOT NULL DEFAULT false,
    `approvalNumber` VARCHAR(191) NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `accountedId` INTEGER NOT NULL,
    `cardId` INTEGER NULL,
    `bankAccountId` INTEGER NULL,

    UNIQUE INDEX `ByCard_accountedId_key`(`accountedId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ByOffset` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `amount` INTEGER NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `accountedId` INTEGER NOT NULL,
    `byOffsetPairId` INTEGER NOT NULL,

    UNIQUE INDEX `ByOffset_accountedId_key`(`accountedId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ByOffsetPair` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BySecurity` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `endorsementType` ENUM('NONE', 'SELF_NOTE', 'OTHERS_NOTE') NULL,
    `endorsement` VARCHAR(191) NOT NULL DEFAULT '',
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `securityId` INTEGER NOT NULL,
    `accountedId` INTEGER NOT NULL,

    UNIQUE INDEX `BySecurity_accountedId_key`(`accountedId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DiscountRateCondition` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `partnerCompanyRegistrationNumber` VARCHAR(191) NOT NULL,
    `packagingType` ENUM('SKID', 'REAM', 'BOX', 'ROLL') NULL,
    `paperDomainId` INTEGER NULL,
    `manufacturerId` INTEGER NULL,
    `paperGroupId` INTEGER NULL,
    `paperTypeId` INTEGER NULL,
    `grammage` INTEGER NULL,
    `sizeX` INTEGER NULL,
    `sizeY` INTEGER NULL,
    `paperColorGroupId` INTEGER NULL,
    `paperColorId` INTEGER NULL,
    `paperPatternId` INTEGER NULL,
    `paperCertId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DiscountRateMap` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `discountRateConditionId` INTEGER NOT NULL,
    `discountRateType` ENUM('SALES', 'PURCHASE') NOT NULL,
    `discountRateMapType` ENUM('BASIC', 'SPECIAL') NOT NULL,
    `discountRate` DOUBLE NOT NULL,
    `discountRateUnit` ENUM('WON_PER_TON', 'WON_PER_REAM', 'WON_PER_BOX', 'PERCENT') NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `DiscountRateMap_discountRateConditionId_discountRateMapType__key`(`discountRateConditionId`, `discountRateMapType`, `discountRateType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderDeposit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `packagingId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `grammage` INTEGER NOT NULL,
    `sizeX` INTEGER NOT NULL,
    `sizeY` INTEGER NOT NULL,
    `paperColorGroupId` INTEGER NULL,
    `paperColorId` INTEGER NULL,
    `paperPatternId` INTEGER NULL,
    `paperCertId` INTEGER NULL,
    `quantity` INTEGER NOT NULL,

    UNIQUE INDEX `OrderDeposit_orderId_key`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Deposit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `srcCompanyRegistrationNumber` VARCHAR(191) NOT NULL,
    `dstCompanyRegistrationNumber` VARCHAR(191) NOT NULL,
    `packagingId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `grammage` INTEGER NOT NULL,
    `sizeX` INTEGER NOT NULL,
    `sizeY` INTEGER NOT NULL,
    `paperColorGroupId` INTEGER NULL,
    `paperColorId` INTEGER NULL,
    `paperPatternId` INTEGER NULL,
    `paperCertId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DepositEvent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `depositId` INTEGER NOT NULL,
    `change` INTEGER NOT NULL,
    `status` ENUM('NORMAL', 'CANCELLED') NOT NULL DEFAULT 'NORMAL',
    `memo` VARCHAR(200) NOT NULL DEFAULT '',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `orderDepositId` INTEGER NULL,
    `targetOrderId` INTEGER NULL,

    UNIQUE INDEX `DepositEvent_targetOrderId_key`(`targetOrderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- CreateTable
CREATE TABLE `OrderRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `srcCompanyId` INTEGER NOT NULL,
    `dstCompanyId` INTEGER NOT NULL,
    `ordererName` VARCHAR(191) NOT NULL,
    `ordererPhoneNo` VARCHAR(191) NOT NULL,
    `locationId` INTEGER NULL,
    `wantedDate` DATETIME(3) NULL,
    `memo` VARCHAR(191) NOT NULL DEFAULT '',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderRequestItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `serial` VARCHAR(191) NOT NULL,
    `item` VARCHAR(191) NOT NULL,
    `quantity` VARCHAR(191) NOT NULL DEFAULT '',
    `memo` VARCHAR(191) NOT NULL DEFAULT '',
    `dstMemo` VARCHAR(191) NOT NULL DEFAULT '',
    `status` ENUM('REQUESTED', 'ON_CHECKING', 'DONE', 'CANCELLED') NOT NULL DEFAULT 'REQUESTED',
    `orderRequestId` INTEGER NOT NULL,

    UNIQUE INDEX `OrderRequestItem_serial_key`(`serial`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TempInvoiceCode` (
    `invoiceCode` VARCHAR(191) NOT NULL,
    `number` INTEGER NOT NULL,
    `maxPercent` DOUBLE NOT NULL,

    UNIQUE INDEX `TempInvoiceCode_invoiceCode_key`(`invoiceCode`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Authentication` (
    `phoneNo` VARCHAR(191) NOT NULL,
    `authNo` VARCHAR(191) NOT NULL,
    `authKey` VARCHAR(191) NOT NULL,
    `count` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Authentication_phoneNo_key`(`phoneNo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuthenticationLog` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `type` ENUM('CREATE', 'AUTH_NO', 'AUTH_KEY') NOT NULL,
    `phoneNo` VARCHAR(191) NOT NULL,
    `authNo` VARCHAR(191) NOT NULL,
    `authKey` VARCHAR(191) NOT NULL,
    `inputAuthNo` VARCHAR(191) NULL,
    `inputAuthKey` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserMenu` (
    `userId` INTEGER NOT NULL,
    `menu` TEXT NOT NULL,

    UNIQUE INDEX `UserMenu_userId_key`(`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_OrderStockToStockEvent` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_OrderStockToStockEvent_AB_unique`(`A`, `B`),
    INDEX `_OrderStockToStockEvent_B_index`(`B`)
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
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `Plan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_initialPlanId_fkey` FOREIGN KEY (`initialPlanId`) REFERENCES `Plan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockPrice` ADD CONSTRAINT `StockPrice_stockId_fkey` FOREIGN KEY (`stockId`) REFERENCES `Stock`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockEvent` ADD CONSTRAINT `StockEvent_stockId_fkey` FOREIGN KEY (`stockId`) REFERENCES `Stock`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockEvent` ADD CONSTRAINT `StockEvent_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `Plan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockEvent` ADD CONSTRAINT `StockEvent_orderProcessId_fkey` FOREIGN KEY (`orderProcessId`) REFERENCES `OrderProcess`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE `OfficialPriceCondition` ADD CONSTRAINT `OfficialPriceCondition_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OfficialPriceCondition` ADD CONSTRAINT `OfficialPriceCondition_paperColorGroupId_fkey` FOREIGN KEY (`paperColorGroupId`) REFERENCES `PaperColorGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OfficialPriceCondition` ADD CONSTRAINT `OfficialPriceCondition_paperColorId_fkey` FOREIGN KEY (`paperColorId`) REFERENCES `PaperColor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OfficialPriceCondition` ADD CONSTRAINT `OfficialPriceCondition_paperPatternId_fkey` FOREIGN KEY (`paperPatternId`) REFERENCES `PaperPattern`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OfficialPriceCondition` ADD CONSTRAINT `OfficialPriceCondition_paperCertId_fkey` FOREIGN KEY (`paperCertId`) REFERENCES `PaperCert`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OfficialPriceMap` ADD CONSTRAINT `OfficialPriceMap_officialPriceConditionId_fkey` FOREIGN KEY (`officialPriceConditionId`) REFERENCES `OfficialPriceCondition`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OfficialPriceMap` ADD CONSTRAINT `OfficialPriceMap_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_srcCompanyId_fkey` FOREIGN KEY (`srcCompanyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_dstCompanyId_fkey` FOREIGN KEY (`dstCompanyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_acceptedCompanyId_fkey` FOREIGN KEY (`acceptedCompanyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_taxInvoiceId_fkey` FOREIGN KEY (`taxInvoiceId`) REFERENCES `TaxInvoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_createdCompanyId_fkey` FOREIGN KEY (`createdCompanyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderHistory` ADD CONSTRAINT `OrderHistory_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderHistory` ADD CONSTRAINT `OrderHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderStock` ADD CONSTRAINT `OrderStock_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderStock` ADD CONSTRAINT `OrderStock_dstLocationId_fkey` FOREIGN KEY (`dstLocationId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderStock` ADD CONSTRAINT `OrderStock_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderStock` ADD CONSTRAINT `OrderStock_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `Warehouse`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderStock` ADD CONSTRAINT `OrderStock_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderStock` ADD CONSTRAINT `OrderStock_packagingId_fkey` FOREIGN KEY (`packagingId`) REFERENCES `Packaging`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderStock` ADD CONSTRAINT `OrderStock_paperColorGroupId_fkey` FOREIGN KEY (`paperColorGroupId`) REFERENCES `PaperColorGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderStock` ADD CONSTRAINT `OrderStock_paperColorId_fkey` FOREIGN KEY (`paperColorId`) REFERENCES `PaperColor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderStock` ADD CONSTRAINT `OrderStock_paperPatternId_fkey` FOREIGN KEY (`paperPatternId`) REFERENCES `PaperPattern`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderStock` ADD CONSTRAINT `OrderStock_paperCertId_fkey` FOREIGN KEY (`paperCertId`) REFERENCES `PaperCert`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderProcess` ADD CONSTRAINT `OrderProcess_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderProcess` ADD CONSTRAINT `OrderProcess_dstLocationId_fkey` FOREIGN KEY (`dstLocationId`) REFERENCES `Location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderProcess` ADD CONSTRAINT `OrderProcess_srcLocationId_fkey` FOREIGN KEY (`srcLocationId`) REFERENCES `Location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderProcess` ADD CONSTRAINT `OrderProcess_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderProcess` ADD CONSTRAINT `OrderProcess_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `Warehouse`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderProcess` ADD CONSTRAINT `OrderProcess_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderProcess` ADD CONSTRAINT `OrderProcess_packagingId_fkey` FOREIGN KEY (`packagingId`) REFERENCES `Packaging`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderProcess` ADD CONSTRAINT `OrderProcess_paperColorGroupId_fkey` FOREIGN KEY (`paperColorGroupId`) REFERENCES `PaperColorGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderProcess` ADD CONSTRAINT `OrderProcess_paperColorId_fkey` FOREIGN KEY (`paperColorId`) REFERENCES `PaperColor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderProcess` ADD CONSTRAINT `OrderProcess_paperPatternId_fkey` FOREIGN KEY (`paperPatternId`) REFERENCES `PaperPattern`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderProcess` ADD CONSTRAINT `OrderProcess_paperCertId_fkey` FOREIGN KEY (`paperCertId`) REFERENCES `PaperCert`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderEtc` ADD CONSTRAINT `OrderEtc_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderRefund` ADD CONSTRAINT `OrderRefund_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderReturn` ADD CONSTRAINT `OrderReturn_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderReturn` ADD CONSTRAINT `OrderReturn_dstLocationId_fkey` FOREIGN KEY (`dstLocationId`) REFERENCES `Location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderReturn` ADD CONSTRAINT `OrderReturn_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderReturn` ADD CONSTRAINT `OrderReturn_packagingId_fkey` FOREIGN KEY (`packagingId`) REFERENCES `Packaging`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderReturn` ADD CONSTRAINT `OrderReturn_paperColorGroupId_fkey` FOREIGN KEY (`paperColorGroupId`) REFERENCES `PaperColorGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderReturn` ADD CONSTRAINT `OrderReturn_paperColorId_fkey` FOREIGN KEY (`paperColorId`) REFERENCES `PaperColor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderReturn` ADD CONSTRAINT `OrderReturn_paperPatternId_fkey` FOREIGN KEY (`paperPatternId`) REFERENCES `PaperPattern`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderReturn` ADD CONSTRAINT `OrderReturn_paperCertId_fkey` FOREIGN KEY (`paperCertId`) REFERENCES `PaperCert`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE `OrderStockTradeAltBundle` ADD CONSTRAINT `OrderStockTradeAltBundle_orderId_companyId_fkey` FOREIGN KEY (`orderId`, `companyId`) REFERENCES `OrderStockTradePrice`(`orderId`, `companyId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Plan` ADD CONSTRAINT `Plan_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Plan` ADD CONSTRAINT `Plan_assignStockEventId_fkey` FOREIGN KEY (`assignStockEventId`) REFERENCES `StockEvent`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Plan` ADD CONSTRAINT `Plan_orderStockId_fkey` FOREIGN KEY (`orderStockId`) REFERENCES `OrderStock`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Plan` ADD CONSTRAINT `Plan_orderProcessId_fkey` FOREIGN KEY (`orderProcessId`) REFERENCES `OrderProcess`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Plan` ADD CONSTRAINT `Plan_orderReturnId_fkey` FOREIGN KEY (`orderReturnId`) REFERENCES `OrderReturn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlanShipping` ADD CONSTRAINT `PlanShipping_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `Plan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlanShipping` ADD CONSTRAINT `PlanShipping_dstLocationId_fkey` FOREIGN KEY (`dstLocationId`) REFERENCES `Location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE `TaskQuantity` ADD CONSTRAINT `TaskQuantity_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shipping` ADD CONSTRAINT `Shipping_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shipping` ADD CONSTRAINT `Shipping_managerId_fkey` FOREIGN KEY (`managerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shipping` ADD CONSTRAINT `Shipping_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE `TaxInvoice` ADD CONSTRAINT `TaxInvoice_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BankAccount` ADD CONSTRAINT `BankAccount_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Card` ADD CONSTRAINT `Card_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Security` ADD CONSTRAINT `Security_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Partner` ADD CONSTRAINT `Partner_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `PartnerTaxManager` ADD CONSTRAINT `PartnerTaxManager_partnerId_fkey` FOREIGN KEY (`partnerId`) REFERENCES `Partner`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Accounted` ADD CONSTRAINT `Accounted_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ByCash` ADD CONSTRAINT `ByCash_accountedId_fkey` FOREIGN KEY (`accountedId`) REFERENCES `Accounted`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ByEtc` ADD CONSTRAINT `ByEtc_accountedId_fkey` FOREIGN KEY (`accountedId`) REFERENCES `Accounted`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ByBankAccount` ADD CONSTRAINT `ByBankAccount_accountedId_fkey` FOREIGN KEY (`accountedId`) REFERENCES `Accounted`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ByBankAccount` ADD CONSTRAINT `ByBankAccount_bankAccountId_fkey` FOREIGN KEY (`bankAccountId`) REFERENCES `BankAccount`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ByCard` ADD CONSTRAINT `ByCard_accountedId_fkey` FOREIGN KEY (`accountedId`) REFERENCES `Accounted`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ByCard` ADD CONSTRAINT `ByCard_cardId_fkey` FOREIGN KEY (`cardId`) REFERENCES `Card`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ByCard` ADD CONSTRAINT `ByCard_bankAccountId_fkey` FOREIGN KEY (`bankAccountId`) REFERENCES `BankAccount`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ByOffset` ADD CONSTRAINT `ByOffset_accountedId_fkey` FOREIGN KEY (`accountedId`) REFERENCES `Accounted`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ByOffset` ADD CONSTRAINT `ByOffset_byOffsetPairId_fkey` FOREIGN KEY (`byOffsetPairId`) REFERENCES `ByOffsetPair`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BySecurity` ADD CONSTRAINT `BySecurity_securityId_fkey` FOREIGN KEY (`securityId`) REFERENCES `Security`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `BySecurity` ADD CONSTRAINT `BySecurity_accountedId_fkey` FOREIGN KEY (`accountedId`) REFERENCES `Accounted`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `DiscountRateCondition` ADD CONSTRAINT `DiscountRateCondition_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiscountRateCondition` ADD CONSTRAINT `DiscountRateCondition_paperDomainId_fkey` FOREIGN KEY (`paperDomainId`) REFERENCES `PaperDomain`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiscountRateCondition` ADD CONSTRAINT `DiscountRateCondition_manufacturerId_fkey` FOREIGN KEY (`manufacturerId`) REFERENCES `Manufacturer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiscountRateCondition` ADD CONSTRAINT `DiscountRateCondition_paperGroupId_fkey` FOREIGN KEY (`paperGroupId`) REFERENCES `PaperGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiscountRateCondition` ADD CONSTRAINT `DiscountRateCondition_paperTypeId_fkey` FOREIGN KEY (`paperTypeId`) REFERENCES `PaperType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiscountRateCondition` ADD CONSTRAINT `DiscountRateCondition_paperColorGroupId_fkey` FOREIGN KEY (`paperColorGroupId`) REFERENCES `PaperColorGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiscountRateCondition` ADD CONSTRAINT `DiscountRateCondition_paperColorId_fkey` FOREIGN KEY (`paperColorId`) REFERENCES `PaperColor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiscountRateCondition` ADD CONSTRAINT `DiscountRateCondition_paperPatternId_fkey` FOREIGN KEY (`paperPatternId`) REFERENCES `PaperPattern`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiscountRateCondition` ADD CONSTRAINT `DiscountRateCondition_paperCertId_fkey` FOREIGN KEY (`paperCertId`) REFERENCES `PaperCert`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiscountRateMap` ADD CONSTRAINT `DiscountRateMap_discountRateConditionId_fkey` FOREIGN KEY (`discountRateConditionId`) REFERENCES `DiscountRateCondition`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDeposit` ADD CONSTRAINT `OrderDeposit_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDeposit` ADD CONSTRAINT `OrderDeposit_packagingId_fkey` FOREIGN KEY (`packagingId`) REFERENCES `Packaging`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDeposit` ADD CONSTRAINT `OrderDeposit_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDeposit` ADD CONSTRAINT `OrderDeposit_paperColorGroupId_fkey` FOREIGN KEY (`paperColorGroupId`) REFERENCES `PaperColorGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDeposit` ADD CONSTRAINT `OrderDeposit_paperColorId_fkey` FOREIGN KEY (`paperColorId`) REFERENCES `PaperColor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDeposit` ADD CONSTRAINT `OrderDeposit_paperPatternId_fkey` FOREIGN KEY (`paperPatternId`) REFERENCES `PaperPattern`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDeposit` ADD CONSTRAINT `OrderDeposit_paperCertId_fkey` FOREIGN KEY (`paperCertId`) REFERENCES `PaperCert`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Deposit` ADD CONSTRAINT `Deposit_packagingId_fkey` FOREIGN KEY (`packagingId`) REFERENCES `Packaging`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Deposit` ADD CONSTRAINT `Deposit_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Deposit` ADD CONSTRAINT `Deposit_paperColorGroupId_fkey` FOREIGN KEY (`paperColorGroupId`) REFERENCES `PaperColorGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Deposit` ADD CONSTRAINT `Deposit_paperColorId_fkey` FOREIGN KEY (`paperColorId`) REFERENCES `PaperColor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Deposit` ADD CONSTRAINT `Deposit_paperPatternId_fkey` FOREIGN KEY (`paperPatternId`) REFERENCES `PaperPattern`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Deposit` ADD CONSTRAINT `Deposit_paperCertId_fkey` FOREIGN KEY (`paperCertId`) REFERENCES `PaperCert`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DepositEvent` ADD CONSTRAINT `DepositEvent_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DepositEvent` ADD CONSTRAINT `DepositEvent_depositId_fkey` FOREIGN KEY (`depositId`) REFERENCES `Deposit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DepositEvent` ADD CONSTRAINT `DepositEvent_orderDepositId_fkey` FOREIGN KEY (`orderDepositId`) REFERENCES `OrderDeposit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DepositEvent` ADD CONSTRAINT `DepositEvent_targetOrderId_fkey` FOREIGN KEY (`targetOrderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDepositTradePrice` ADD CONSTRAINT `OrderDepositTradePrice_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDepositTradePrice` ADD CONSTRAINT `OrderDepositTradePrice_orderId_companyId_fkey` FOREIGN KEY (`orderId`, `companyId`) REFERENCES `TradePrice`(`orderId`, `companyId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDepositTradeAltBundle` ADD CONSTRAINT `OrderDepositTradeAltBundle_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDepositTradeAltBundle` ADD CONSTRAINT `OrderDepositTradeAltBundle_orderId_companyId_fkey` FOREIGN KEY (`orderId`, `companyId`) REFERENCES `OrderDepositTradePrice`(`orderId`, `companyId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderRequest` ADD CONSTRAINT `OrderRequest_srcCompanyId_fkey` FOREIGN KEY (`srcCompanyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderRequest` ADD CONSTRAINT `OrderRequest_dstCompanyId_fkey` FOREIGN KEY (`dstCompanyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderRequest` ADD CONSTRAINT `OrderRequest_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderRequestItem` ADD CONSTRAINT `OrderRequestItem_orderRequestId_fkey` FOREIGN KEY (`orderRequestId`) REFERENCES `OrderRequest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserMenu` ADD CONSTRAINT `UserMenu_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_OrderStockToStockEvent` ADD CONSTRAINT `_OrderStockToStockEvent_A_fkey` FOREIGN KEY (`A`) REFERENCES `OrderStock`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_OrderStockToStockEvent` ADD CONSTRAINT `_OrderStockToStockEvent_B_fkey` FOREIGN KEY (`B`) REFERENCES `StockEvent`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
