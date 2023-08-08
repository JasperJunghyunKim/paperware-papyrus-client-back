/*
  Warnings:

  - You are about to drop the column `chargeAmount` on the `ByCard` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `ByCard` table. All the data in the column will be lost.
  - Added the required column `amount` to the `ByCard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vatPrice` to the `ByCard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ByCard` DROP COLUMN `chargeAmount`,
    DROP COLUMN `totalAmount`,
    ADD COLUMN `amount` INTEGER NOT NULL,
    ADD COLUMN `vatPrice` INTEGER NOT NULL;
