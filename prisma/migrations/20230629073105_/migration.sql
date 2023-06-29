/*
  Warnings:

  - Added the required column `companyId` to the `OrderProcess` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grammage` to the `OrderProcess` table without a default value. This is not possible if the table is not empty.
  - Added the required column `packagingId` to the `OrderProcess` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `OrderProcess` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sizeX` to the `OrderProcess` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sizeY` to the `OrderProcess` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `OrderProcess` ADD COLUMN `companyId` INTEGER NOT NULL,
    ADD COLUMN `grammage` INTEGER NOT NULL,
    ADD COLUMN `packagingId` INTEGER NOT NULL,
    ADD COLUMN `paperCertId` INTEGER NULL,
    ADD COLUMN `paperColorGroupId` INTEGER NULL,
    ADD COLUMN `paperColorId` INTEGER NULL,
    ADD COLUMN `paperPatternId` INTEGER NULL,
    ADD COLUMN `planId` INTEGER NULL,
    ADD COLUMN `productId` INTEGER NOT NULL,
    ADD COLUMN `quantity` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `sizeX` INTEGER NOT NULL,
    ADD COLUMN `sizeY` INTEGER NOT NULL,
    ADD COLUMN `warehouseId` INTEGER NULL;

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
