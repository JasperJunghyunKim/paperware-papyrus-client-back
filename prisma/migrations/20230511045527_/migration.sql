-- AlterTable
ALTER TABLE `Company` MODIFY `address` VARCHAR(500) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `Location` MODIFY `address` VARCHAR(500) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `OrderStock` ADD COLUMN `orderStockId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Warehouse` MODIFY `address` VARCHAR(500) NOT NULL DEFAULT '';

-- AddForeignKey
ALTER TABLE `OrderStock` ADD CONSTRAINT `OrderStock_orderStockId_fkey` FOREIGN KEY (`orderStockId`) REFERENCES `OrderStock`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
