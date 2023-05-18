/*
  Warnings:

  - The values [MANUAL_DEFAULT] on the enum `OrderStockTradePrice_officialPriceType` will be removed. If these variants are still used in the database, this will fail.
  - The values [MANUAL_DEFAULT] on the enum `OrderStockTradePrice_officialPriceType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `OrderStockTradePrice` MODIFY `officialPriceType` ENUM('NONE', 'MANUAL_NONE', 'RETAIL', 'WHOLESALE') NOT NULL DEFAULT 'NONE',
    MODIFY `discountType` ENUM('NONE', 'MANUAL_NONE', 'DEFAULT', 'SPECIAL') NOT NULL DEFAULT 'DEFAULT';

-- AlterTable
ALTER TABLE `StockPrice` MODIFY `officialPriceType` ENUM('NONE', 'MANUAL_NONE', 'RETAIL', 'WHOLESALE') NOT NULL DEFAULT 'NONE',
    MODIFY `discountType` ENUM('NONE', 'MANUAL_NONE', 'DEFAULT', 'SPECIAL') NOT NULL DEFAULT 'DEFAULT';
