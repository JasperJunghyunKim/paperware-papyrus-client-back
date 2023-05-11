/*
  Warnings:

  - You are about to drop the column `officialPriceType` on the `OfficialPriceMap` table. All the data in the column will be lost.
  - You are about to drop the column `paperCertId` on the `OfficialPriceMap` table. All the data in the column will be lost.
  - You are about to drop the column `paperColorGroupId` on the `OfficialPriceMap` table. All the data in the column will be lost.
  - You are about to drop the column `paperColorId` on the `OfficialPriceMap` table. All the data in the column will be lost.
  - You are about to drop the column `paperPatternId` on the `OfficialPriceMap` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `OfficialPriceMap` table. All the data in the column will be lost.
  - Added the required column `officialPriceConditionId` to the `OfficialPriceMap` table without a default value. This is not possible if the table is not empty.
  - Added the required column `officialPriceMapType` to the `OfficialPriceMap` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `OfficialPriceMap` DROP FOREIGN KEY `OfficialPriceMap_paperCertId_fkey`;

-- DropForeignKey
ALTER TABLE `OfficialPriceMap` DROP FOREIGN KEY `OfficialPriceMap_paperColorGroupId_fkey`;

-- DropForeignKey
ALTER TABLE `OfficialPriceMap` DROP FOREIGN KEY `OfficialPriceMap_paperColorId_fkey`;

-- DropForeignKey
ALTER TABLE `OfficialPriceMap` DROP FOREIGN KEY `OfficialPriceMap_paperPatternId_fkey`;

-- DropForeignKey
ALTER TABLE `OfficialPriceMap` DROP FOREIGN KEY `OfficialPriceMap_productId_fkey`;

-- AlterTable
ALTER TABLE `OfficialPriceMap` DROP COLUMN `officialPriceType`,
    DROP COLUMN `paperCertId`,
    DROP COLUMN `paperColorGroupId`,
    DROP COLUMN `paperColorId`,
    DROP COLUMN `paperPatternId`,
    DROP COLUMN `productId`,
    ADD COLUMN `officialPriceConditionId` INTEGER NOT NULL,
    ADD COLUMN `officialPriceMapType` ENUM('WHOLESALE', 'RETAIL') NOT NULL;

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
