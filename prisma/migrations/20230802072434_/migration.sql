-- AlterTable
ALTER TABLE `Company` ADD COLUMN `isActivated` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false;
