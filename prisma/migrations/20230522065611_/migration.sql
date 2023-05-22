/*
  Warnings:

  - The values [SET_OFF] on the enum `Accounted_accountedMethod` will be removed. If these variants are still used in the database, this will fail.
  - The values [PAID_ACCOUNTS_RECEIVABLE,PAID_UNPAID_AMOUNTS,PAID_ADVANCES,PAID_MISCELLANEOUS_INCOME,PAID_PRODUCT_SALES,COLLECTED_ACCOUNTS_RECEIVABLE,COLLECTED_UNPAID_EXPENSES,COLLECTED_PREPAID_EXPENSES,COLLECTED_MISCELLANEOUS_LOSSES,COLLECTED_PRODUCT_PURCHASES] on the enum `Accounted_accountedSubject` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `deletedYn` on the `BankAccount` table. All the data in the column will be lost.
  - The values [KAKAOBANK,KOOKMINBANK,KEB_HANABANK,SHINHANBANK,WOORIBANK,CITIBANK_KOREA,HANABANK,SC_FIRSTBANK] on the enum `BankAccount_bankComapny` will be removed. If these variants are still used in the database, this will fail.
  - The values [deposit] on the enum `BankAccount_accountType` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `Card` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `cardId` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `deletedYn` on the `Card` table. All the data in the column will be lost.
  - Added the required column `id` to the `Card` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Accounted` MODIFY `accountedMethod` ENUM('ACCOUNT_TRANSFER', 'PROMISSORY_NOTE', 'CARD_PAYMENT', 'CASH', 'OFFSET', 'ETC', 'All') NOT NULL,
    MODIFY `accountedSubject` ENUM('ACCOUNTS_RECEIVABLE', 'UNPAID', 'ADVANCES', 'MISCELLANEOUS_INCOME', 'PRODUCT_SALES', 'ETC', 'All') NOT NULL;

-- AlterTable
ALTER TABLE `BankAccount` DROP COLUMN `deletedYn`,
    ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `bankComapny` ENUM('KAKAO_BANK', 'KOOKMIN_BANK', 'KEB_HANA_BANK', 'NH_BANK', 'SHINHAN_BANK', 'IBK', 'WOORI_BANK', 'CITI_BANK_KOREA', 'HANA_BANK', 'SC_FIRST_BANK', 'KYONGNAM_BANK', 'KWANGJU_BANK', 'DAEGU_BANK', 'DEUTSCHE_BANK', 'BANK_OF_AMERICA', 'BUSAN_BANK', 'NACF', 'SAVINGS_BANK', 'NACCSF', 'SUHYUP_BANK', 'NACUFOK', 'POST_OFFICE', 'JEONBUK_BANK', 'JEJU_BANK', 'K_BANK', 'TOS_BANK') NOT NULL,
    MODIFY `accountType` ENUM('DEPOSIT') NOT NULL;

-- AlterTable
ALTER TABLE `Card` DROP PRIMARY KEY,
    DROP COLUMN `cardId`,
    DROP COLUMN `deletedYn`,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    ADD PRIMARY KEY (`id`);

-- CreateTable
CREATE TABLE `ByBankAccount` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bankAccountAmount` INTEGER NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `accountedId` INTEGER NOT NULL,
    `bankAccountId` INTEGER NOT NULL,

    UNIQUE INDEX `ByBankAccount_accountedId_key`(`accountedId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ByCard` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cardAmount` INTEGER NOT NULL,
    `chargeAmount` INTEGER NOT NULL,
    `totalAmount` INTEGER NOT NULL,
    `isCharge` BOOLEAN NOT NULL DEFAULT false,
    `approvalNumber` VARCHAR(191) NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `accountedId` INTEGER NOT NULL,
    `cardId` INTEGER NOT NULL,

    UNIQUE INDEX `ByCard_accountedId_key`(`accountedId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ByOffset` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `offsetAmount` INTEGER NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `accountedId` INTEGER NOT NULL,

    UNIQUE INDEX `ByOffset_accountedId_key`(`accountedId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ByOffsetPair` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `paidId` INTEGER NOT NULL,
    `collectedId` INTEGER NOT NULL,
    `byOffsetId` INTEGER NOT NULL,

    UNIQUE INDEX `ByOffsetPair_byOffsetId_key`(`byOffsetId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ByBankAccount` ADD CONSTRAINT `ByBankAccount_accountedId_fkey` FOREIGN KEY (`accountedId`) REFERENCES `Accounted`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ByBankAccount` ADD CONSTRAINT `ByBankAccount_bankAccountId_fkey` FOREIGN KEY (`bankAccountId`) REFERENCES `BankAccount`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ByCard` ADD CONSTRAINT `ByCard_accountedId_fkey` FOREIGN KEY (`accountedId`) REFERENCES `Accounted`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ByCard` ADD CONSTRAINT `ByCard_cardId_fkey` FOREIGN KEY (`cardId`) REFERENCES `Card`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ByOffset` ADD CONSTRAINT `ByOffset_accountedId_fkey` FOREIGN KEY (`accountedId`) REFERENCES `Accounted`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ByOffsetPair` ADD CONSTRAINT `ByOffsetPair_byOffsetId_fkey` FOREIGN KEY (`byOffsetId`) REFERENCES `ByOffset`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
