/*
  Warnings:

  - You are about to drop the column `type` on the `DepositEvent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `DepositEvent` DROP COLUMN `type`,
    ADD COLUMN `status` ENUM('NORMAL', 'CANCELLED') NOT NULL DEFAULT 'NORMAL';
