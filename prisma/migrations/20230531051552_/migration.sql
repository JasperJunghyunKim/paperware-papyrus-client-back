/*
  Warnings:

  - You are about to drop the `TaskInitiate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TaskReceiving` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `TaskInitiate` DROP FOREIGN KEY `TaskInitiate_stockEventId_fkey`;

-- DropForeignKey
ALTER TABLE `TaskInitiate` DROP FOREIGN KEY `TaskInitiate_taskId_fkey`;

-- DropForeignKey
ALTER TABLE `TaskReceiving` DROP FOREIGN KEY `TaskReceiving_stockEventId_fkey`;

-- DropForeignKey
ALTER TABLE `TaskReceiving` DROP FOREIGN KEY `TaskReceiving_taskId_fkey`;

-- DropTable
DROP TABLE `TaskInitiate`;

-- DropTable
DROP TABLE `TaskReceiving`;
