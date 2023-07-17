/*
  Warnings:

  - You are about to drop the column `srcCompnayRegistrationNumber` on the `Deposit` table. All the data in the column will be lost.
  - Added the required column `srcCompanyRegistrationNumber` to the `Deposit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Deposit` DROP COLUMN `srcCompnayRegistrationNumber`,
    ADD COLUMN `srcCompanyRegistrationNumber` VARCHAR(191) NOT NULL;
