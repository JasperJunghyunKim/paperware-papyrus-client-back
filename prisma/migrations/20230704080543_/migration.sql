/*
  Warnings:

  - You are about to drop the column `email` on the `Company` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Company` DROP COLUMN `email`;

-- AlterTable
ALTER TABLE `Partner` ADD COLUMN `creditLimit` INTEGER NOT NULL DEFAULT 0;
