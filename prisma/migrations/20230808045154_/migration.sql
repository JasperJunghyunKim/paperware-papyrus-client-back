/*
  Warnings:

  - You are about to drop the column `offsetAmount` on the `ByOffset` table. All the data in the column will be lost.
  - You are about to drop the column `byOffsetId` on the `ByOffsetPair` table. All the data in the column will be lost.
  - You are about to drop the column `collectedId` on the `ByOffsetPair` table. All the data in the column will be lost.
  - You are about to drop the column `paidId` on the `ByOffsetPair` table. All the data in the column will be lost.
  - Added the required column `amount` to the `ByOffset` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `ByOffsetPair` DROP FOREIGN KEY `ByOffsetPair_byOffsetId_fkey`;

-- AlterTable
ALTER TABLE `ByOffset` DROP COLUMN `offsetAmount`,
    ADD COLUMN `amount` INTEGER NOT NULL,
    ADD COLUMN `byOffsetPairId` INTEGER NULL;

-- AlterTable
ALTER TABLE `ByOffsetPair` DROP COLUMN `byOffsetId`,
    DROP COLUMN `collectedId`,
    DROP COLUMN `paidId`;

-- AddForeignKey
ALTER TABLE `ByOffset` ADD CONSTRAINT `ByOffset_byOffsetPairId_fkey` FOREIGN KEY (`byOffsetPairId`) REFERENCES `ByOffsetPair`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
