/*
  Warnings:

  - Added the required column `dstLocationId` to the `OrderReturn` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locationId` to the `OrderReturn` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wantedDate` to the `OrderReturn` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `OrderReturn` ADD COLUMN `dstLocationId` INTEGER NOT NULL,
    ADD COLUMN `locationId` INTEGER NOT NULL,
    ADD COLUMN `wantedDate` DATETIME(3) NOT NULL;

-- AddForeignKey
ALTER TABLE `OrderReturn` ADD CONSTRAINT `OrderReturn_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
