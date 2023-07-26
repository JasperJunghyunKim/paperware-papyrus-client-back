-- AlterTable
ALTER TABLE `Location` ADD COLUMN `phoneNo` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `TaskQuantity` ADD COLUMN `invoiceId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `TaskQuantity` ADD CONSTRAINT `TaskQuantity_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
