/*
  Warnings:

  - The values [ENDORSED] on the enum `Security_securityStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Security` MODIFY `securityStatus` ENUM('NONE', 'NORMAL_PAYMENT', 'DISCOUNT_PAYMENT', 'INSOLVENCY', 'LOST', 'SAFEKEEPING') NOT NULL DEFAULT 'NONE';
