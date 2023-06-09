-- AlterTable
ALTER TABLE `Order` ADD COLUMN `dstDepositEventId` INTEGER NULL,
    ADD COLUMN `srcDepositEventId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_srcDepositEventId_fkey` FOREIGN KEY (`srcDepositEventId`) REFERENCES `DepositEvent`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_dstDepositEventId_fkey` FOREIGN KEY (`dstDepositEventId`) REFERENCES `DepositEvent`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
