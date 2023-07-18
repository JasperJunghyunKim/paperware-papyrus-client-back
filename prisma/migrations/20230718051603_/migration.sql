/*
  Warnings:

  - Added the required column `companyRegistrationNumber` to the `DepositEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `DepositEvent` ADD COLUMN `companyRegistrationNumber` VARCHAR(191) NOT NULL;
