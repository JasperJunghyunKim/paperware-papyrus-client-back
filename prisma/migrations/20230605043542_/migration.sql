/*
  Warnings:

  - Added the required column `grammage` to the `OrderDeposit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `packagingId` to the `OrderDeposit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `OrderDeposit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `OrderDeposit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sizeX` to the `OrderDeposit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sizeY` to the `OrderDeposit` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `OrderDeposit` DROP FOREIGN KEY `OrderDeposit_depositEventId_fkey`;

-- AlterTable
ALTER TABLE `OrderDeposit` ADD COLUMN `grammage` INTEGER NOT NULL,
    ADD COLUMN `packagingId` INTEGER NOT NULL,
    ADD COLUMN `paperCertId` INTEGER NULL,
    ADD COLUMN `paperColorGroupId` INTEGER NULL,
    ADD COLUMN `paperColorId` INTEGER NULL,
    ADD COLUMN `paperPatternId` INTEGER NULL,
    ADD COLUMN `productId` INTEGER NOT NULL,
    ADD COLUMN `quantity` INTEGER NOT NULL,
    ADD COLUMN `sizeX` INTEGER NOT NULL,
    ADD COLUMN `sizeY` INTEGER NOT NULL,
    MODIFY `depositEventId` INTEGER NULL;

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
ALTER TABLE `OrderDeposit` ADD CONSTRAINT `OrderDeposit_depositEventId_fkey` FOREIGN KEY (`depositEventId`) REFERENCES `DepositEvent`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
