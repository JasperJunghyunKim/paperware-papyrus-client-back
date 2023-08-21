-- CreateTable
CREATE TABLE `Cart` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('SALES', 'PURCHASE') NOT NULL,
    `userId` INTEGER NOT NULL,
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

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `Warehouse`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_packagingId_fkey` FOREIGN KEY (`packagingId`) REFERENCES `Packaging`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_paperColorGroupId_fkey` FOREIGN KEY (`paperColorGroupId`) REFERENCES `PaperColorGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_paperColorId_fkey` FOREIGN KEY (`paperColorId`) REFERENCES `PaperColor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_paperPatternId_fkey` FOREIGN KEY (`paperPatternId`) REFERENCES `PaperPattern`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_paperCertId_fkey` FOREIGN KEY (`paperCertId`) REFERENCES `PaperCert`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
