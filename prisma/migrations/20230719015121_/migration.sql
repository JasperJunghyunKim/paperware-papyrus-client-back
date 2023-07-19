/*
  Warnings:

  - You are about to drop the column `companyRegistrationNumber` on the `DepositEvent` table. All the data in the column will be lost.
  - Added the required column `userId` to the `DepositEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `DepositEvent` DROP COLUMN `companyRegistrationNumber`,
    ADD COLUMN `userId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `DepositEvent` ADD CONSTRAINT `DepositEvent_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
