/*
  Warnings:

  - You are about to drop the column `ceo_name` on the `partner` table. All the data in the column will be lost.
  - You are about to drop the column `ceo_phone_number` on the `partner` table. All the data in the column will be lost.
  - You are about to drop the column `company_registration_number` on the `partner` table. All the data in the column will be lost.
  - You are about to drop the column `partner_name` on the `partner` table. All the data in the column will be lost.
  - You are about to drop the column `representative_number` on the `partner` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `partner` DROP COLUMN `ceo_name`,
    DROP COLUMN `ceo_phone_number`,
    DROP COLUMN `company_registration_number`,
    DROP COLUMN `partner_name`,
    DROP COLUMN `representative_number`;
