/*
  Warnings:

  - Added the required column `memo` to the `TaskQuantity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `TaskQuantity` ADD COLUMN `memo` VARCHAR(191) NOT NULL;
