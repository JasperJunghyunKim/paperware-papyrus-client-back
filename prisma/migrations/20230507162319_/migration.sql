/*
  Warnings:

  - You are about to drop the column `taskStatus` on the `Task` table. All the data in the column will be lost.
  - Added the required column `status` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `StockGroupEvent_planId_fkey` ON `StockGroupEvent`;

-- AlterTable
ALTER TABLE `Task` DROP COLUMN `taskStatus`,
    ADD COLUMN `status` ENUM('PREPARING', 'PROGRESSING', 'PROGRESSED') NOT NULL;
