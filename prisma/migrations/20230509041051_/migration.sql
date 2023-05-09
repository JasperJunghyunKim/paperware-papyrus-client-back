/*
  Warnings:

  - Added the required column `grammage` to the `OrderStock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `packagingId` to the `OrderStock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `OrderStock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sizeX` to the `OrderStock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sizeY` to the `OrderStock` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `OrderStock` DROP FOREIGN KEY `OrderStock_stockGroupId_fkey`;

-- AlterTable
ALTER TABLE `OrderStock` ADD COLUMN `grammage` INTEGER NOT NULL,
    ADD COLUMN `packagingId` INTEGER NOT NULL,
    ADD COLUMN `paperCertId` INTEGER NULL,
    ADD COLUMN `paperColorGroupId` INTEGER NULL,
    ADD COLUMN `paperColorId` INTEGER NULL,
    ADD COLUMN `paperPatternId` INTEGER NULL,
    ADD COLUMN `productId` INTEGER NOT NULL,
    ADD COLUMN `sizeX` INTEGER NOT NULL,
    ADD COLUMN `sizeY` INTEGER NOT NULL,
    MODIFY `stockGroupId` INTEGER NULL;

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
ALTER TABLE `OrderStock` ADD CONSTRAINT `OrderStock_stockGroupId_fkey` FOREIGN KEY (`stockGroupId`) REFERENCES `StockGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
