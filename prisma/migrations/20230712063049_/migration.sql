/*
  Warnings:

  - You are about to drop the column `companyRegistrationNumber` on the `TaxInvoice` table. All the data in the column will be lost.
  - Added the required column `dstCompanyAddress` to the `TaxInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dstCompanyBizItem` to the `TaxInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dstCompanyBizType` to the `TaxInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dstCompanyName` to the `TaxInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dstCompanyRegistrationNumber` to the `TaxInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dstCompanyRepresentative` to the `TaxInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `srcCompanyAddress` to the `TaxInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `srcCompanyBizItem` to the `TaxInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `srcCompanyBizType` to the `TaxInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `srcCompanyName` to the `TaxInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `srcCompanyRegistrationNumber` to the `TaxInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `srcCompanyRepresentative` to the `TaxInvoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `TaxInvoice` DROP COLUMN `companyRegistrationNumber`,
    ADD COLUMN `dstCompanyAddress` VARCHAR(191) NOT NULL,
    ADD COLUMN `dstCompanyBizItem` VARCHAR(191) NOT NULL,
    ADD COLUMN `dstCompanyBizType` VARCHAR(191) NOT NULL,
    ADD COLUMN `dstCompanyName` VARCHAR(191) NOT NULL,
    ADD COLUMN `dstCompanyRegistrationNumber` VARCHAR(191) NOT NULL,
    ADD COLUMN `dstCompanyRepresentative` VARCHAR(191) NOT NULL,
    ADD COLUMN `srcCompanyAddress` VARCHAR(191) NOT NULL,
    ADD COLUMN `srcCompanyBizItem` VARCHAR(191) NOT NULL,
    ADD COLUMN `srcCompanyBizType` VARCHAR(191) NOT NULL,
    ADD COLUMN `srcCompanyName` VARCHAR(191) NOT NULL,
    ADD COLUMN `srcCompanyRegistrationNumber` VARCHAR(191) NOT NULL,
    ADD COLUMN `srcCompanyRepresentative` VARCHAR(191) NOT NULL;
