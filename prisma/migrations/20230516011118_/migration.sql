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
  - You are about to drop the `partner` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `companyRegistrationNumber` on table `Company` required. This step will fail if there are existing NULL values in that column.
  - Made the column `invoiceCode` on table `Company` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `accounted` DROP FOREIGN KEY `accounted_partner_id_fkey`;

-- DropForeignKey
ALTER TABLE `partner` DROP FOREIGN KEY `partner_company_id_fkey`;

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

-- DropTable
DROP TABLE `partner`;

-- CreateTable
CREATE TABLE `Partner` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `companyRegistrationNumber` VARCHAR(191) NOT NULL,
    `partner_nick_name` VARCHAR(100) NOT NULL,
    `memo` VARCHAR(500) NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Partner_company_id_companyRegistrationNumber_key`(`company_id`, `companyRegistrationNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Partner` ADD CONSTRAINT `Partner_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `Company`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `accounted` ADD CONSTRAINT `accounted_partner_id_fkey` FOREIGN KEY (`partner_id`) REFERENCES `Partner`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
