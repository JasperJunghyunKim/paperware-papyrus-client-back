/*
  Warnings:

  - You are about to drop the column `discountUnitPrice` on the `StockPrice` table. All the data in the column will be lost.
  - Added the required column `unitPrice` to the `StockPrice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `StockPrice` DROP COLUMN `discountUnitPrice`,
    ADD COLUMN `discountPrice` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `unitPrice` DOUBLE NOT NULL;
