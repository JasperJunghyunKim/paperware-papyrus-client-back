-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_stockAcceptedCompanyId_fkey` FOREIGN KEY (`stockAcceptedCompanyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
