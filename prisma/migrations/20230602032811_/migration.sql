/*
  Warnings:

  - You are about to drop the column `initialOrderId` on the `Stock` table. All the data in the column will be lost.
  - Added the required column `initialPlanId` to the `Stock` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Stock` DROP FOREIGN KEY `Stock_initialOrderId_fkey`;

-- AlterTable
ALTER TABLE `Plan` MODIFY `status` ENUM('PREPARING', 'PROGRESSING', 'PROGRESSED', 'CANCELLED') NOT NULL DEFAULT 'PREPARING';

-- AlterTable
ALTER TABLE `Stock` DROP COLUMN `initialOrderId`,
    ADD COLUMN `initialPlanId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_initialPlanId_fkey` FOREIGN KEY (`initialPlanId`) REFERENCES `Plan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
