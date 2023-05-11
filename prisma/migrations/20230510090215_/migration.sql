/*
  Warnings:

  - Added the required column `officialPriceUnit` to the `OfficialPriceMap` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `OfficialPriceMap` ADD COLUMN `officialPriceUnit` ENUM('WON_PER_TON', 'WON_PER_REAM', 'WON_PER_BOX') NOT NULL;
