/*
  Warnings:

  - The values [ORDER_CANCELLED,OFFER_CANCELLED] on the enum `Order_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Order` MODIFY `status` ENUM('ORDER_PREPARING', 'ORDER_REQUESTED', 'ORDER_REJECTED', 'OFFER_PREPARING', 'OFFER_REQUESTED', 'OFFER_REJECTED', 'ACCEPTED', 'ORDER_DELETED', 'OFFER_DELETED', 'CANCELLED') NOT NULL DEFAULT 'ORDER_PREPARING';
