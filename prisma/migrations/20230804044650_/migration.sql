/*
  Warnings:

  - Made the column `memo` on table `Accounted` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Accounted` MODIFY `memo` VARCHAR(500) NOT NULL DEFAULT '';
