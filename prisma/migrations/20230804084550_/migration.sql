/*
  Warnings:

  - Made the column `endorsement` on table `BySecurity` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `BySecurity` MODIFY `endorsement` VARCHAR(191) NOT NULL DEFAULT '';
