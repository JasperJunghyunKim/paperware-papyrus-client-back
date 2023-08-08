/*
  Warnings:

  - The values [All] on the enum `Accounted_accountedMethod` will be removed. If these variants are still used in the database, this will fail.
  - The values [All] on the enum `Accounted_accountedSubject` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Accounted` MODIFY `accountedMethod` ENUM('ACCOUNT_TRANSFER', 'PROMISSORY_NOTE', 'CARD_PAYMENT', 'CASH', 'OFFSET', 'ETC') NOT NULL,
    MODIFY `accountedSubject` ENUM('ACCOUNTS_RECEIVABLE', 'UNPAID', 'ADVANCES', 'MISCELLANEOUS_INCOME', 'PRODUCT_SALES', 'ETC') NOT NULL;
