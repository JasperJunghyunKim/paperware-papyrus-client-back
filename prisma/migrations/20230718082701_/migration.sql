-- CreateTable
CREATE TABLE `OrderRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `srcCompanyId` INTEGER NOT NULL,
    `dstCompanyId` INTEGER NOT NULL,
    `ordererName` VARCHAR(191) NOT NULL,
    `ordererPhoneNo` VARCHAR(191) NOT NULL,
    `locationId` INTEGER NULL,
    `wantedDate` DATETIME(3) NULL,
    `memo` VARCHAR(191) NOT NULL DEFAULT '',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderRequestItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `serial` VARCHAR(191) NOT NULL,
    `item` VARCHAR(191) NOT NULL,
    `quantity` VARCHAR(191) NOT NULL DEFAULT '',
    `memo` VARCHAR(191) NOT NULL DEFAULT '',
    `status` ENUM('REQUESTED', 'ON_CHECKING', 'DONE', 'CANCELLED') NOT NULL DEFAULT 'REQUESTED',
    `orderRequestId` INTEGER NOT NULL,

    UNIQUE INDEX `OrderRequestItem_serial_key`(`serial`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrderRequest` ADD CONSTRAINT `OrderRequest_srcCompanyId_fkey` FOREIGN KEY (`srcCompanyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderRequest` ADD CONSTRAINT `OrderRequest_dstCompanyId_fkey` FOREIGN KEY (`dstCompanyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderRequest` ADD CONSTRAINT `OrderRequest_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderRequestItem` ADD CONSTRAINT `OrderRequestItem_orderRequestId_fkey` FOREIGN KEY (`orderRequestId`) REFERENCES `OrderRequest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
