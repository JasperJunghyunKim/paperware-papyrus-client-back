/*
  Warnings:

  - You are about to drop the column `discountUnitPrice` on the `OrderStockTradePrice` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `OrderStockTradePrice` DROP COLUMN `discountUnitPrice`,
    ADD COLUMN `discountPrice` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `unitPrice` DOUBLE NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE `OrderStockTradeAltBundle` ADD CONSTRAINT `OrderStockTradeAltBundle_orderId_companyId_fkey` FOREIGN KEY (`orderId`, `companyId`) REFERENCES `OrderStockTradePrice`(`orderId`, `companyId`) ON DELETE RESTRICT ON UPDATE CASCADE;
