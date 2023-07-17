/*
  Warnings:

  - You are about to drop the column `companyId` on the `Deposit` table. All the data in the column will be lost.
  - You are about to drop the column `depositType` on the `Deposit` table. All the data in the column will be lost.
  - You are about to drop the column `partnerCompanyRegistrationNumber` on the `Deposit` table. All the data in the column will be lost.
  - Added the required column `dstCompanyRegistrationNumber` to the `Deposit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `srcCompnayRegistrationNumber` to the `Deposit` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Deposit` DROP FOREIGN KEY `Deposit_companyId_fkey`;

-- AlterTable
ALTER TABLE `Deposit` DROP COLUMN `companyId`,
    DROP COLUMN `depositType`,
    DROP COLUMN `partnerCompanyRegistrationNumber`,
    ADD COLUMN `dstCompanyRegistrationNumber` VARCHAR(191) NOT NULL,
    ADD COLUMN `srcCompnayRegistrationNumber` VARCHAR(191) NOT NULL;
