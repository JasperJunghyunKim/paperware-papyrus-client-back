/*
  Warnings:

  - You are about to drop the column `chg_dt` on the `accounted` table. All the data in the column will be lost.
  - You are about to drop the column `chg_id` on the `accounted` table. All the data in the column will be lost.
  - You are about to drop the column `chg_nm` on the `accounted` table. All the data in the column will be lost.
  - You are about to drop the column `reg_dt` on the `accounted` table. All the data in the column will be lost.
  - You are about to drop the column `reg_id` on the `accounted` table. All the data in the column will be lost.
  - You are about to drop the column `reg_nm` on the `accounted` table. All the data in the column will be lost.
  - You are about to drop the column `chg_dt` on the `by_cash` table. All the data in the column will be lost.
  - You are about to drop the column `chg_id` on the `by_cash` table. All the data in the column will be lost.
  - You are about to drop the column `chg_nm` on the `by_cash` table. All the data in the column will be lost.
  - You are about to drop the column `reg_dt` on the `by_cash` table. All the data in the column will be lost.
  - You are about to drop the column `reg_id` on the `by_cash` table. All the data in the column will be lost.
  - You are about to drop the column `reg_nm` on the `by_cash` table. All the data in the column will be lost.
  - You are about to drop the column `chg_dt` on the `by_etc` table. All the data in the column will be lost.
  - You are about to drop the column `chg_id` on the `by_etc` table. All the data in the column will be lost.
  - You are about to drop the column `chg_nm` on the `by_etc` table. All the data in the column will be lost.
  - You are about to drop the column `reg_dt` on the `by_etc` table. All the data in the column will be lost.
  - You are about to drop the column `reg_id` on the `by_etc` table. All the data in the column will be lost.
  - You are about to drop the column `reg_nm` on the `by_etc` table. All the data in the column will be lost.
  - You are about to drop the column `chg_dt` on the `partner` table. All the data in the column will be lost.
  - You are about to drop the column `chg_id` on the `partner` table. All the data in the column will be lost.
  - You are about to drop the column `chg_nm` on the `partner` table. All the data in the column will be lost.
  - You are about to drop the column `reg_dt` on the `partner` table. All the data in the column will be lost.
  - You are about to drop the column `reg_id` on the `partner` table. All the data in the column will be lost.
  - You are about to drop the column `reg_nm` on the `partner` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[company_id,companyRegistrationNumber]` on the table `partner` will be added. If there are existing duplicate values, this will fail.
  - Made the column `companyRegistrationNumber` on table `Company` required. This step will fail if there are existing NULL values in that column.
  - Made the column `invoiceCode` on table `Company` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `companyRegistrationNumber` to the `partner` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `BusinessRelationship` ADD COLUMN `isActivated` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `Company` MODIFY `companyRegistrationNumber` VARCHAR(191) NOT NULL,
    MODIFY `invoiceCode` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `accounted` DROP COLUMN `chg_dt`,
    DROP COLUMN `chg_id`,
    DROP COLUMN `chg_nm`,
    DROP COLUMN `reg_dt`,
    DROP COLUMN `reg_id`,
    DROP COLUMN `reg_nm`;

-- AlterTable
ALTER TABLE `by_cash` DROP COLUMN `chg_dt`,
    DROP COLUMN `chg_id`,
    DROP COLUMN `chg_nm`,
    DROP COLUMN `reg_dt`,
    DROP COLUMN `reg_id`,
    DROP COLUMN `reg_nm`;

-- AlterTable
ALTER TABLE `by_etc` DROP COLUMN `chg_dt`,
    DROP COLUMN `chg_id`,
    DROP COLUMN `chg_nm`,
    DROP COLUMN `reg_dt`,
    DROP COLUMN `reg_id`,
    DROP COLUMN `reg_nm`;

-- AlterTable
ALTER TABLE `partner` DROP COLUMN `chg_dt`,
    DROP COLUMN `chg_id`,
    DROP COLUMN `chg_nm`,
    DROP COLUMN `reg_dt`,
    DROP COLUMN `reg_id`,
    DROP COLUMN `reg_nm`,
    ADD COLUMN `companyRegistrationNumber` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `bank_account` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `bank_company` ENUM('KAKAOBANK', 'KOOKMINBANK', 'KEB_HANABANK', 'NH_BANK', 'SHINHANBANK', 'IBK', 'WOORIBANK', 'CITIBANK_KOREA', 'HANABANK', 'SC_FIRSTBANK', 'KYONGNAM_BANK', 'KWANGJU_BANK', 'DAEGU_BANK', 'DEUTSCHE_BANK', 'BANK_OF_AMERICA', 'BUSAN_BANK', 'NACF', 'SAVINGS_BANK', 'NACCSF', 'SUHYUP_BANK', 'NACUFOK', 'POST_OFFICE', 'JEONBUK_BANK', 'JEJU_BANK', 'K_BANK', 'TOS_BANK') NOT NULL,
    `account_nm` VARCHAR(30) NOT NULL,
    `account_type` ENUM('deposit') NOT NULL,
    `account_no` VARCHAR(30) NOT NULL,
    `account_holder` VARCHAR(50) NOT NULL,
    `deleted_yn` BOOLEAN NOT NULL DEFAULT false,
    `reg_id` VARCHAR(255) NULL,
    `reg_nm` VARCHAR(255) NULL,
    `chg_id` VARCHAR(255) NULL,
    `chg_nm` VARCHAR(255) NULL,
    `chg_dt` DATETIME(3) NOT NULL,
    `reg_dt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `card` (
    `card_id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `card_nm` VARCHAR(50) NOT NULL,
    `card_company` ENUM('BC_CARD', 'KB_CARD', 'SAMSUNG_CARD', 'SHINHAN_CARD', 'WOORI_CARD', 'HANA_CARD', 'LOTTE_CARD', 'HYUNDAI_CARD', 'NH_CARD') NOT NULL,
    `card_no` VARCHAR(50) NOT NULL,
    `card_holder` VARCHAR(50) NOT NULL,
    `deleted_yn` BOOLEAN NOT NULL DEFAULT false,
    `reg_id` VARCHAR(255) NULL,
    `reg_nm` VARCHAR(255) NULL,
    `chg_id` VARCHAR(255) NULL,
    `chg_nm` VARCHAR(255) NULL,
    `chg_dt` DATETIME(3) NOT NULL,
    `reg_dt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`card_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `partner_company_id_companyRegistrationNumber_key` ON `partner`(`company_id`, `companyRegistrationNumber`);

-- AddForeignKey
ALTER TABLE `bank_account` ADD CONSTRAINT `bank_account_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `Company`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `card` ADD CONSTRAINT `card_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `Company`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
