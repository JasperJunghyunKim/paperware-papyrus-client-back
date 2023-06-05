/*
  Warnings:

  - You are about to drop the column `isDeleted` on the `Plan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Plan` DROP COLUMN `isDeleted`,
    ADD COLUMN `status` ENUM('PREPARING', 'PROGRESSING', 'CANCELLED') NOT NULL DEFAULT 'PREPARING';
