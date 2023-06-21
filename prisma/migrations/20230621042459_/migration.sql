/*
  Warnings:

  - You are about to drop the column `isDirectShipping` on the `OrderProcess` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `OrderProcess` DROP COLUMN `isDirectShipping`,
    ADD COLUMN `isDstDirectShipping` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isSrcDirectShipping` BOOLEAN NOT NULL DEFAULT false;
