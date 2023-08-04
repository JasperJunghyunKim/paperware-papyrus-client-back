/*
  Warnings:

  - Added the required column `type` to the `Shipping` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Shipping` ADD COLUMN `companyRegistrationNumber` VARCHAR(191) NULL,
    ADD COLUMN `memo` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `price` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `type` ENUM('INHOUSE', 'OUTSOURCE', 'PARTNER_PICKUP') NOT NULL,
    ADD COLUMN `userId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Shipping` ADD CONSTRAINT `Shipping_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
