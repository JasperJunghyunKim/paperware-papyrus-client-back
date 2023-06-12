/*
  Warnings:

  - You are about to drop the column `wantedDate` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Order` DROP COLUMN `wantedDate`,
    MODIFY `orderType` ENUM('NORMAL', 'DEPOSIT', 'OUTSOURCE_PROCESS', 'ETC') NOT NULL;

-- AlterTable
ALTER TABLE `OrderCutting` ADD COLUMN `wantedDate` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `OrderStock` ADD COLUMN `wantedDate` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `OrderEtc` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `item` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `OrderEtc_orderId_key`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrderEtc` ADD CONSTRAINT `OrderEtc_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
