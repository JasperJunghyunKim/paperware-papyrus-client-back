/*
  Warnings:

  - You are about to drop the column `locationId` on the `Order` table. All the data in the column will be lost.
  - The values [ORDER_CANCELLED,ORDER_ACCEPTED,STOCK_OFFER_REQUESTED,STOCK_OFFER_ACCEPTED] on the enum `Order_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Order` DROP FOREIGN KEY `Order_locationId_fkey`;

-- AlterTable
ALTER TABLE `Order` DROP COLUMN `locationId`,
    MODIFY `status` ENUM('ORDER_PREPARING', 'ORDER_REQUESTED', 'ORDER_REJECTED', 'OFFER_PREPARING', 'OFFER_REQUESTED', 'OFFER_REJECTED', 'ACCEPTED') NOT NULL DEFAULT 'ORDER_PREPARING';
