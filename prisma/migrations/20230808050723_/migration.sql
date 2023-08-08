/*
  Warnings:

  - You are about to drop the column `bankAccountAmount` on the `ByBankAccount` table. All the data in the column will be lost.
  - You are about to drop the column `cashAmount` on the `ByCash` table. All the data in the column will be lost.
  - You are about to drop the column `etcAmount` on the `ByEtc` table. All the data in the column will be lost.
  - Added the required column `amount` to the `ByBankAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `ByCash` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `ByEtc` table without a default value. This is not possible if the table is not empty.
  - Made the column `byOffsetPairId` on table `ByOffset` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `ByOffset` DROP FOREIGN KEY `ByOffset_byOffsetPairId_fkey`;

-- AlterTable
ALTER TABLE `ByBankAccount` DROP COLUMN `bankAccountAmount`,
    ADD COLUMN `amount` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `ByCash` DROP COLUMN `cashAmount`,
    ADD COLUMN `amount` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `ByEtc` DROP COLUMN `etcAmount`,
    ADD COLUMN `amount` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `ByOffset` MODIFY `byOffsetPairId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `ByOffset` ADD CONSTRAINT `ByOffset_byOffsetPairId_fkey` FOREIGN KEY (`byOffsetPairId`) REFERENCES `ByOffsetPair`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
