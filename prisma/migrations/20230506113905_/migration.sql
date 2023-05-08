/*
  Warnings:

  - A unique constraint covering the columns `[productId,packagingId,grammage,sizeX,sizeY,paperColorGroupId,paperColorId,paperPatternId,paperCertId,warehouseId,companyId]` on the table `StockGroup` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `StockGroup_productId_packagingId_grammage_sizeX_sizeY_paperC_key` ON `StockGroup`(`productId`, `packagingId`, `grammage`, `sizeX`, `sizeY`, `paperColorGroupId`, `paperColorId`, `paperPatternId`, `paperCertId`, `warehouseId`, `companyId`);
