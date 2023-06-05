/*
  Warnings:

  - You are about to drop the column `orderId` on the `DepositEvent` table. All the data in the column will be lost.
  - You are about to drop the column `grammage` on the `OrderDeposit` table. All the data in the column will be lost.
  - You are about to drop the column `packagingId` on the `OrderDeposit` table. All the data in the column will be lost.
  - You are about to drop the column `paperCertId` on the `OrderDeposit` table. All the data in the column will be lost.
  - You are about to drop the column `paperColorGroupId` on the `OrderDeposit` table. All the data in the column will be lost.
  - You are about to drop the column `paperColorId` on the `OrderDeposit` table. All the data in the column will be lost.
  - You are about to drop the column `paperPatternId` on the `OrderDeposit` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `OrderDeposit` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `OrderDeposit` table. All the data in the column will be lost.
  - You are about to drop the column `sizeX` on the `OrderDeposit` table. All the data in the column will be lost.
  - You are about to drop the column `sizeY` on the `OrderDeposit` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[orderId]` on the table `OrderDeposit` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[depositEventId]` on the table `OrderDeposit` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `depositEventId` to the `OrderDeposit` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `DepositEvent` DROP FOREIGN KEY `DepositEvent_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderDeposit` DROP FOREIGN KEY `OrderDeposit_packagingId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderDeposit` DROP FOREIGN KEY `OrderDeposit_paperCertId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderDeposit` DROP FOREIGN KEY `OrderDeposit_paperColorGroupId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderDeposit` DROP FOREIGN KEY `OrderDeposit_paperColorId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderDeposit` DROP FOREIGN KEY `OrderDeposit_paperPatternId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderDeposit` DROP FOREIGN KEY `OrderDeposit_productId_fkey`;

-- AlterTable
ALTER TABLE `Deposit` MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT;

-- AlterTable
ALTER TABLE `DepositEvent` DROP COLUMN `orderId`,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT;

-- AlterTable
ALTER TABLE `OrderDeposit` DROP COLUMN `grammage`,
    DROP COLUMN `packagingId`,
    DROP COLUMN `paperCertId`,
    DROP COLUMN `paperColorGroupId`,
    DROP COLUMN `paperColorId`,
    DROP COLUMN `paperPatternId`,
    DROP COLUMN `productId`,
    DROP COLUMN `quantity`,
    DROP COLUMN `sizeX`,
    DROP COLUMN `sizeY`,
    ADD COLUMN `depositEventId` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `OrderDeposit_orderId_key` ON `OrderDeposit`(`orderId`);

-- CreateIndex
CREATE UNIQUE INDEX `OrderDeposit_depositEventId_key` ON `OrderDeposit`(`depositEventId`);

-- AddForeignKey
ALTER TABLE `OrderDeposit` ADD CONSTRAINT `OrderDeposit_depositEventId_fkey` FOREIGN KEY (`depositEventId`) REFERENCES `DepositEvent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
