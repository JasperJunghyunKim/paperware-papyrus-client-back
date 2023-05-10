-- AlterTable
ALTER TABLE `OrderStock` ADD COLUMN `warehouseId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `OrderStock` ADD CONSTRAINT `OrderStock_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `Warehouse`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
