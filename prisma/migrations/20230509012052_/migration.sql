/*
  Warnings:

  - The values [STOKC_OFFER_PREPARING] on the enum `Order_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Order` MODIFY `status` ENUM('ORDER_PREPARING', 'ORDER_CANCELLED', 'ORDER_REQUESTED', 'ORDER_ACCEPTED', 'ORDER_REJECTED', 'OFFER_PREPARING', 'STOCK_OFFER_REQUESTED', 'STOCK_OFFER_ACCEPTED') NOT NULL DEFAULT 'ORDER_PREPARING';
