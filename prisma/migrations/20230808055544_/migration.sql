/*
  Warnings:

  - You are about to drop the column `partnerCompanyRegistrationNumber` on the `Accounted` table. All the data in the column will be lost.
  - Added the required column `companyRegistrationNumber` to the `Accounted` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Accounted` DROP COLUMN `partnerCompanyRegistrationNumber`,
    ADD COLUMN `companyRegistrationNumber` VARCHAR(191) NOT NULL;
