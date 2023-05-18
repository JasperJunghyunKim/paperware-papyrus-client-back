-- AlterTable
ALTER TABLE `BusinessRelationshipRequest` ADD COLUMN `isPurchase` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isSales` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `DiscountRateCondition` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
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
    `partnerId` INTEGER NOT NULL,
    `discountRateConditionId` INTEGER NOT NULL,
    `discountRateMapType` ENUM('BASIC', 'SPECIAL') NOT NULL,
    `isPurchase` BOOLEAN NOT NULL,
    `discountRate` DOUBLE NOT NULL,
    `discountRateUnit` ENUM('WON_PER_TON', 'WON_PER_REAM', 'WON_PER_BOX') NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `DiscountRateMap_partnerId_discountRateConditionId_discountRa_key`(`partnerId`, `discountRateConditionId`, `discountRateMapType`, `isPurchase`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
ALTER TABLE `DiscountRateMap` ADD CONSTRAINT `DiscountRateMap_partnerId_fkey` FOREIGN KEY (`partnerId`) REFERENCES `Partner`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiscountRateMap` ADD CONSTRAINT `DiscountRateMap_discountRateConditionId_fkey` FOREIGN KEY (`discountRateConditionId`) REFERENCES `DiscountRateCondition`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
