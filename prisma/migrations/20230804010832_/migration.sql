/*
  Warnings:

  - You are about to drop the column `userId` on the `Shipping` table. All the data in the column will be lost.
  - Added the required column `createdById` to the `Shipping` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Shipping` DROP FOREIGN KEY `Shipping_userId_fkey`;

-- AlterTable
ALTER TABLE `Shipping` DROP COLUMN `userId`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `createdById` INTEGER NOT NULL,
    ADD COLUMN `managerId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Shipping` ADD CONSTRAINT `Shipping_managerId_fkey` FOREIGN KEY (`managerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shipping` ADD CONSTRAINT `Shipping_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
