-- AlterTable
ALTER TABLE `Order` MODIFY `orderType` ENUM('NORMAL', 'DEPOSIT', 'OUTSOURCE_PROCESS') NOT NULL;

-- AlterTable
ALTER TABLE `Plan` ADD COLUMN `orderCuttingId` INTEGER NULL;

-- AlterTable
ALTER TABLE `StockEvent` ADD COLUMN `orderCuttingId` INTEGER NULL;

-- CreateTable
CREATE TABLE `OrderCutting` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `dstLocationId` INTEGER NULL,
    `isDirectShipping` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `OrderCutting_orderId_key`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StockEvent` ADD CONSTRAINT `StockEvent_orderCuttingId_fkey` FOREIGN KEY (`orderCuttingId`) REFERENCES `OrderCutting`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderCutting` ADD CONSTRAINT `OrderCutting_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderCutting` ADD CONSTRAINT `OrderCutting_dstLocationId_fkey` FOREIGN KEY (`dstLocationId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Plan` ADD CONSTRAINT `Plan_orderCuttingId_fkey` FOREIGN KEY (`orderCuttingId`) REFERENCES `OrderCutting`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
