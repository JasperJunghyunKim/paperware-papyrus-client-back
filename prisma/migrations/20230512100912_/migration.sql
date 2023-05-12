-- AlterTable
ALTER TABLE `Stock` ADD COLUMN `initialOrderId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_initialOrderId_fkey` FOREIGN KEY (`initialOrderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
