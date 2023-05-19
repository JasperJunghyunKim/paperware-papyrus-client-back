/*
  Warnings:

  - You are about to drop the column `isPurchase` on the `DiscountRateMap` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[discountRateConditionId,discountRateMapType,discountRateType]` on the table `DiscountRateMap` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `discountRateType` to the `DiscountRateMap` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `DiscountRateMap` DROP COLUMN `isPurchase`,
    ADD COLUMN `discountRateType` ENUM('SALES', 'PURCHASE') NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `DiscountRateMap_discountRateConditionId_discountRateMapType__key` ON `DiscountRateMap`(`discountRateConditionId`, `discountRateMapType`, `discountRateType`);
