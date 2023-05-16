/*
  Warnings:

  - You are about to drop the `accounted` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bank_account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `by_cash` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `by_etc` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `card` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `partner` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `accounted` DROP FOREIGN KEY `accounted_partner_id_fkey`;

-- DropForeignKey
ALTER TABLE `bank_account` DROP FOREIGN KEY `bank_account_company_id_fkey`;

-- DropForeignKey
ALTER TABLE `by_cash` DROP FOREIGN KEY `by_cash_accounted_id_fkey`;

-- DropForeignKey
ALTER TABLE `by_etc` DROP FOREIGN KEY `by_etc_accounted_id_fkey`;

-- DropForeignKey
ALTER TABLE `card` DROP FOREIGN KEY `card_company_id_fkey`;

-- DropForeignKey
ALTER TABLE `partner` DROP FOREIGN KEY `partner_company_id_fkey`;

-- DropTable
DROP TABLE `accounted`;

-- DropTable
DROP TABLE `bank_account`;

-- DropTable
DROP TABLE `by_cash`;

-- DropTable
DROP TABLE `by_etc`;

-- DropTable
DROP TABLE `card`;

-- DropTable
DROP TABLE `partner`;

-- CreateTable
CREATE TABLE `BankAccount` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `bankComapny` ENUM('KAKAOBANK', 'KOOKMINBANK', 'KEB_HANABANK', 'NH_BANK', 'SHINHANBANK', 'IBK', 'WOORIBANK', 'CITIBANK_KOREA', 'HANABANK', 'SC_FIRSTBANK', 'KYONGNAM_BANK', 'KWANGJU_BANK', 'DAEGU_BANK', 'DEUTSCHE_BANK', 'BANK_OF_AMERICA', 'BUSAN_BANK', 'NACF', 'SAVINGS_BANK', 'NACCSF', 'SUHYUP_BANK', 'NACUFOK', 'POST_OFFICE', 'JEONBUK_BANK', 'JEJU_BANK', 'K_BANK', 'TOS_BANK') NOT NULL,
    `accountName` VARCHAR(30) NOT NULL,
    `accountType` ENUM('deposit') NOT NULL,
    `accountNumber` VARCHAR(30) NOT NULL,
    `accountHolder` VARCHAR(50) NOT NULL,
    `deletedYn` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Card` (
    `cardId` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `cardName` VARCHAR(50) NOT NULL,
    `cardCompany` ENUM('BC_CARD', 'KB_CARD', 'SAMSUNG_CARD', 'SHINHAN_CARD', 'WOORI_CARD', 'HANA_CARD', 'LOTTE_CARD', 'HYUNDAI_CARD', 'NH_CARD') NOT NULL,
    `cardNumber` VARCHAR(50) NOT NULL,
    `cardHolder` VARCHAR(50) NOT NULL,
    `deletedYn` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`cardId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Partner` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `companyRegistrationNumber` VARCHAR(191) NOT NULL,
    `partnerNickName` VARCHAR(100) NOT NULL,
    `memo` VARCHAR(500) NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Partner_companyId_companyRegistrationNumber_key`(`companyId`, `companyRegistrationNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Accounted` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `accountedType` ENUM('PAID', 'COLLECTED') NOT NULL,
    `accountedMethod` ENUM('ACCOUNT_TRANSFER', 'PROMISSORY_NOTE', 'CARD_PAYMENT', 'CASH', 'SET_OFF', 'ETC', 'All') NOT NULL,
    `accountedDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `accountedSubject` ENUM('PAID_ACCOUNTS_RECEIVABLE', 'PAID_UNPAID_AMOUNTS', 'PAID_ADVANCES', 'PAID_MISCELLANEOUS_INCOME', 'PAID_PRODUCT_SALES', 'COLLECTED_ACCOUNTS_RECEIVABLE', 'COLLECTED_UNPAID_EXPENSES', 'COLLECTED_PREPAID_EXPENSES', 'COLLECTED_MISCELLANEOUS_LOSSES', 'COLLECTED_PRODUCT_PURCHASES', 'ETC', 'All') NOT NULL,
    `memo` VARCHAR(500) NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `partnerId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ByCash` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cashAmount` INTEGER NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `accountedId` INTEGER NOT NULL,

    UNIQUE INDEX `ByCash_accountedId_key`(`accountedId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ByEtc` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `etcAmount` INTEGER NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `accountedId` INTEGER NOT NULL,

    UNIQUE INDEX `ByEtc_accountedId_key`(`accountedId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BankAccount` ADD CONSTRAINT `BankAccount_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Card` ADD CONSTRAINT `Card_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Partner` ADD CONSTRAINT `Partner_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Accounted` ADD CONSTRAINT `Accounted_partnerId_fkey` FOREIGN KEY (`partnerId`) REFERENCES `Partner`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ByCash` ADD CONSTRAINT `ByCash_accountedId_fkey` FOREIGN KEY (`accountedId`) REFERENCES `Accounted`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ByEtc` ADD CONSTRAINT `ByEtc_accountedId_fkey` FOREIGN KEY (`accountedId`) REFERENCES `Accounted`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
