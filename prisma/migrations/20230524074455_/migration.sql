/*
  Warnings:

  - You are about to drop the column `byOffsetPairId` on the `ByOffsetPair` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[byOffsetId]` on the table `ByOffsetPair` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `byOffsetId` to the `ByOffsetPair` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderType` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `ByOffsetPair` DROP FOREIGN KEY `ByOffsetPair_byOffsetPairId_fkey`;

-- AlterTable
ALTER TABLE `ByOffsetPair` DROP COLUMN `byOffsetPairId`,
    ADD COLUMN `byOffsetId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Order` ADD COLUMN `orderType` ENUM('NORMAL', 'DEPOSIT', 'WITHDRAW') NOT NULL;

-- CreateTable
CREATE TABLE `Deposit` (
    `partnerId` INTEGER NOT NULL,
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
    `orderId` INTEGER NULL,
    `memo` VARCHAR(200) NOT NULL DEFAULT '',

    PRIMARY KEY (`partnerId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `ByOffsetPair_byOffsetId_key` ON `ByOffsetPair`(`byOffsetId`);

-- AddForeignKey
ALTER TABLE `ByOffsetPair` ADD CONSTRAINT `ByOffsetPair_byOffsetId_fkey` FOREIGN KEY (`byOffsetId`) REFERENCES `ByOffset`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Deposit` ADD CONSTRAINT `Deposit_partnerId_fkey` FOREIGN KEY (`partnerId`) REFERENCES `Partner`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Deposit` ADD CONSTRAINT `Deposit_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Deposit` ADD CONSTRAINT `Deposit_packagingId_fkey` FOREIGN KEY (`packagingId`) REFERENCES `Packaging`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Deposit` ADD CONSTRAINT `Deposit_paperColorGroupId_fkey` FOREIGN KEY (`paperColorGroupId`) REFERENCES `PaperColorGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Deposit` ADD CONSTRAINT `Deposit_paperColorId_fkey` FOREIGN KEY (`paperColorId`) REFERENCES `PaperColor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Deposit` ADD CONSTRAINT `Deposit_paperPatternId_fkey` FOREIGN KEY (`paperPatternId`) REFERENCES `PaperPattern`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Deposit` ADD CONSTRAINT `Deposit_paperCertId_fkey` FOREIGN KEY (`paperCertId`) REFERENCES `PaperCert`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Deposit` ADD CONSTRAINT `Deposit_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
