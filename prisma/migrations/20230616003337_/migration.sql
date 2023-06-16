-- CreateTable
CREATE TABLE `PlanShipping` (
    `planId` INTEGER NOT NULL,
    `dstLocationId` INTEGER NOT NULL,
    `isDirectShipping` BOOLEAN NOT NULL DEFAULT false,
    `wantedDate` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PlanShipping_planId_key`(`planId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PlanShipping` ADD CONSTRAINT `PlanShipping_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `Plan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlanShipping` ADD CONSTRAINT `PlanShipping_dstLocationId_fkey` FOREIGN KEY (`dstLocationId`) REFERENCES `Location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
