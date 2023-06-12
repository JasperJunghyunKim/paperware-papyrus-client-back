/*
  Warnings:

  - You are about to drop the column `grammage` on the `OrderStock` table. All the data in the column will be lost.
  - You are about to drop the column `orderStockId` on the `OrderStock` table. All the data in the column will be lost.
  - You are about to drop the column `packagingId` on the `OrderStock` table. All the data in the column will be lost.
  - You are about to drop the column `paperCertId` on the `OrderStock` table. All the data in the column will be lost.
  - You are about to drop the column `paperColorGroupId` on the `OrderStock` table. All the data in the column will be lost.
  - You are about to drop the column `paperColorId` on the `OrderStock` table. All the data in the column will be lost.
  - You are about to drop the column `paperPatternId` on the `OrderStock` table. All the data in the column will be lost.
  - You are about to drop the column `planId` on the `OrderStock` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `OrderStock` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `OrderStock` table. All the data in the column will be lost.
  - You are about to drop the column `sizeX` on the `OrderStock` table. All the data in the column will be lost.
  - You are about to drop the column `sizeY` on the `OrderStock` table. All the data in the column will be lost.
  - You are about to drop the column `stockGroupId` on the `OrderStock` table. All the data in the column will be lost.
  - You are about to drop the column `warehouseId` on the `OrderStock` table. All the data in the column will be lost.
  - You are about to drop the column `memo` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `targetStockGroupEventId` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `Task` table. All the data in the column will be lost.
  - The values [QUANTITY] on the enum `Task_type` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `StockGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StockGroupEvent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StockGroupPrice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_StockEventInPlan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_StockEventOutPlan` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `type` to the `Plan` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `OrderStock` DROP FOREIGN KEY `OrderStock_orderStockId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderStock` DROP FOREIGN KEY `OrderStock_packagingId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderStock` DROP FOREIGN KEY `OrderStock_paperCertId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderStock` DROP FOREIGN KEY `OrderStock_paperColorGroupId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderStock` DROP FOREIGN KEY `OrderStock_paperColorId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderStock` DROP FOREIGN KEY `OrderStock_paperPatternId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderStock` DROP FOREIGN KEY `OrderStock_planId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderStock` DROP FOREIGN KEY `OrderStock_productId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderStock` DROP FOREIGN KEY `OrderStock_stockGroupId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderStock` DROP FOREIGN KEY `OrderStock_warehouseId_fkey`;

-- DropForeignKey
ALTER TABLE `Plan` DROP FOREIGN KEY `Plan_targetStockGroupEventId_fkey`;

-- DropForeignKey
ALTER TABLE `StockGroup` DROP FOREIGN KEY `StockGroup_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `StockGroup` DROP FOREIGN KEY `StockGroup_orderStockId_fkey`;

-- DropForeignKey
ALTER TABLE `StockGroup` DROP FOREIGN KEY `StockGroup_packagingId_fkey`;

-- DropForeignKey
ALTER TABLE `StockGroup` DROP FOREIGN KEY `StockGroup_paperCertId_fkey`;

-- DropForeignKey
ALTER TABLE `StockGroup` DROP FOREIGN KEY `StockGroup_paperColorGroupId_fkey`;

-- DropForeignKey
ALTER TABLE `StockGroup` DROP FOREIGN KEY `StockGroup_paperColorId_fkey`;

-- DropForeignKey
ALTER TABLE `StockGroup` DROP FOREIGN KEY `StockGroup_paperPatternId_fkey`;

-- DropForeignKey
ALTER TABLE `StockGroup` DROP FOREIGN KEY `StockGroup_productId_fkey`;

-- DropForeignKey
ALTER TABLE `StockGroup` DROP FOREIGN KEY `StockGroup_warehouseId_fkey`;

-- DropForeignKey
ALTER TABLE `StockGroupEvent` DROP FOREIGN KEY `StockGroupEvent_stockGroupId_fkey`;

-- DropForeignKey
ALTER TABLE `StockGroupPrice` DROP FOREIGN KEY `StockGroupPrice_stockGruopId_fkey`;

-- DropForeignKey
ALTER TABLE `_StockEventInPlan` DROP FOREIGN KEY `_StockEventInPlan_A_fkey`;

-- DropForeignKey
ALTER TABLE `_StockEventInPlan` DROP FOREIGN KEY `_StockEventInPlan_B_fkey`;

-- DropForeignKey
ALTER TABLE `_StockEventOutPlan` DROP FOREIGN KEY `_StockEventOutPlan_A_fkey`;

-- DropForeignKey
ALTER TABLE `_StockEventOutPlan` DROP FOREIGN KEY `_StockEventOutPlan_B_fkey`;

-- DropIndex
DROP INDEX `StockEvent_id_stockId_key` ON `StockEvent`;

-- AlterTable
ALTER TABLE `Accounted` MODIFY `memo` VARCHAR(500) NULL;

-- AlterTable
ALTER TABLE `OrderStock` DROP COLUMN `grammage`,
    DROP COLUMN `orderStockId`,
    DROP COLUMN `packagingId`,
    DROP COLUMN `paperCertId`,
    DROP COLUMN `paperColorGroupId`,
    DROP COLUMN `paperColorId`,
    DROP COLUMN `paperPatternId`,
    DROP COLUMN `planId`,
    DROP COLUMN `productId`,
    DROP COLUMN `quantity`,
    DROP COLUMN `sizeX`,
    DROP COLUMN `sizeY`,
    DROP COLUMN `stockGroupId`,
    DROP COLUMN `warehouseId`,
    ADD COLUMN `isDirectShipping` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Plan` DROP COLUMN `memo`,
    DROP COLUMN `status`,
    DROP COLUMN `targetStockGroupEventId`,
    ADD COLUMN `orderStockId` INTEGER NULL,
    ADD COLUMN `type` ENUM('INHOUSE_CREATE', 'INHOUSE_MODIFY', 'INHOUSE_RELOCATION', 'INHOUSE_PROCESS', 'TRADE_NORMAL_SELLER', 'TRADE_NORMAL_BUYER', 'TRADE_WITHDRAW_SELLER', 'TRADE_WITHDRAW_BUYER', 'TRADE_OUTSOURCE_PROCESS_SELLER', 'TRADE_OUTSOURCE_PROCESS_BUYER') NOT NULL;

-- AlterTable
ALTER TABLE `Shipping` ADD COLUMN `status` ENUM('PREPARING', 'PROGRESSING', 'DONE') NOT NULL DEFAULT 'PREPARING';

-- AlterTable
ALTER TABLE `Stock` ADD COLUMN `planId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Task` DROP COLUMN `isDeleted`,
    MODIFY `type` ENUM('CONVERTING', 'GUILLOTINE', 'RELEASE', 'RECEIVING', 'INSTANTIATE') NOT NULL,
    MODIFY `status` ENUM('PREPARING', 'PROGRESSING', 'PROGRESSED', 'CANCELLED') NOT NULL;

-- DropTable
DROP TABLE `StockGroup`;

-- DropTable
DROP TABLE `StockGroupEvent`;

-- DropTable
DROP TABLE `StockGroupPrice`;

-- DropTable
DROP TABLE `_StockEventInPlan`;

-- DropTable
DROP TABLE `_StockEventOutPlan`;

-- CreateTable
CREATE TABLE `TaskReceiving` (
    `taskId` INTEGER NOT NULL,
    `stockEventId` INTEGER NOT NULL,

    UNIQUE INDEX `TaskReceiving_stockEventId_key`(`stockEventId`),
    PRIMARY KEY (`taskId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaskInitiate` (
    `taskId` INTEGER NOT NULL,
    `stockEventId` INTEGER NOT NULL,

    UNIQUE INDEX `TaskInitiate_stockEventId_key`(`stockEventId`),
    PRIMARY KEY (`taskId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Security` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `securityType` ENUM('PROMISSORY_NOTE', 'ELECTRONIC_NOTE', 'ELECTRONIC_BOND', 'PERSONAL_CHECK', 'DEMAND_DRAFT', 'HOUSEHOLD_CHECK', 'STATIONERY_NOTE', 'ETC') NOT NULL,
    `securitySerial` VARCHAR(191) NOT NULL,
    `securityAmount` DOUBLE NOT NULL,
    `securityStatus` ENUM('NONE', 'ENDORSED', 'NORMAL_PAYMENT', 'DISCOUNT_PAYMENT', 'INSOLVENCY', 'LOST', 'SAFEKEEPING') NOT NULL DEFAULT 'NONE',
    `drawedStatus` ENUM('SELF', 'ACCOUNTED') NOT NULL,
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
CREATE TABLE `BySecurity` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `endorsementType` ENUM('NONE', 'SELF_NOTE', 'OTHERS_NOTE') NULL,
    `endorsement` VARCHAR(191) NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `securityId` INTEGER NOT NULL,
    `accountedId` INTEGER NOT NULL,

    UNIQUE INDEX `BySecurity_accountedId_key`(`accountedId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PlanToStockEvent` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_PlanToStockEvent_AB_unique`(`A`, `B`),
    INDEX `_PlanToStockEvent_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `Plan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Plan` ADD CONSTRAINT `Plan_orderStockId_fkey` FOREIGN KEY (`orderStockId`) REFERENCES `OrderStock`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskReceiving` ADD CONSTRAINT `TaskReceiving_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `Task`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskReceiving` ADD CONSTRAINT `TaskReceiving_stockEventId_fkey` FOREIGN KEY (`stockEventId`) REFERENCES `StockEvent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskInitiate` ADD CONSTRAINT `TaskInitiate_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `Task`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskInitiate` ADD CONSTRAINT `TaskInitiate_stockEventId_fkey` FOREIGN KEY (`stockEventId`) REFERENCES `StockEvent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Security` ADD CONSTRAINT `Security_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `BySecurity` ADD CONSTRAINT `BySecurity_securityId_fkey` FOREIGN KEY (`securityId`) REFERENCES `Security`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `BySecurity` ADD CONSTRAINT `BySecurity_accountedId_fkey` FOREIGN KEY (`accountedId`) REFERENCES `Accounted`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `_PlanToStockEvent` ADD CONSTRAINT `_PlanToStockEvent_A_fkey` FOREIGN KEY (`A`) REFERENCES `Plan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PlanToStockEvent` ADD CONSTRAINT `_PlanToStockEvent_B_fkey` FOREIGN KEY (`B`) REFERENCES `StockEvent`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
