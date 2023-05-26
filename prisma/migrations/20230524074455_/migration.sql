/*
  Warnings:

  - You are about to drop the column `byOffsetPairId` on the `ByOffsetPair` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[byOffsetId]` on the table `ByOffsetPair` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `byOffsetId` to the `ByOffsetPair` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderType` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `ByOffsetPair` DROP FOREIGN KEY `ByOffsetPair_byOffsetPairId_fkey`;

-- AlterTable
ALTER TABLE `ByOffsetPair` DROP COLUMN `byOffsetPairId`,
    ADD COLUMN `byOffsetId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Order` ADD COLUMN `orderType` ENUM('NORMAL', 'DEPOSIT', 'WITHDRAW') NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `ByOffsetPair_byOffsetId_key` ON `ByOffsetPair`(`byOffsetId`);

-- AddForeignKey
ALTER TABLE `ByOffsetPair` ADD CONSTRAINT `ByOffsetPair_byOffsetId_fkey` FOREIGN KEY (`byOffsetId`) REFERENCES `ByOffset`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;