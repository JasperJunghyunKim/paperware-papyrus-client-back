/*
  Warnings:

  - You are about to drop the `Refund` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Return` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Refund` DROP FOREIGN KEY `Refund_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `Return` DROP FOREIGN KEY `Return_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `Return` DROP FOREIGN KEY `Return_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `Return` DROP FOREIGN KEY `Return_packagingId_fkey`;

-- DropForeignKey
ALTER TABLE `Return` DROP FOREIGN KEY `Return_paperCertId_fkey`;

-- DropForeignKey
ALTER TABLE `Return` DROP FOREIGN KEY `Return_paperColorGroupId_fkey`;

-- DropForeignKey
ALTER TABLE `Return` DROP FOREIGN KEY `Return_paperColorId_fkey`;

-- DropForeignKey
ALTER TABLE `Return` DROP FOREIGN KEY `Return_paperPatternId_fkey`;

-- DropForeignKey
ALTER TABLE `Return` DROP FOREIGN KEY `Return_productId_fkey`;

-- DropForeignKey
ALTER TABLE `Return` DROP FOREIGN KEY `Return_warehouseId_fkey`;

-- DropTable
DROP TABLE `Refund`;

-- DropTable
DROP TABLE `Return`;

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

    UNIQUE INDEX `OrderReturn_orderId_key`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrderRefund` ADD CONSTRAINT `OrderRefund_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderReturn` ADD CONSTRAINT `OrderReturn_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderReturn` ADD CONSTRAINT `OrderReturn_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderReturn` ADD CONSTRAINT `OrderReturn_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `Warehouse`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
