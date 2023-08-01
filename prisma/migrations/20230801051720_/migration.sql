-- CreateTable
CREATE TABLE `Authentication` (
    `phoneNo` VARCHAR(191) NOT NULL,
    `authNo` VARCHAR(191) NOT NULL,
    `authKey` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Authentication_phoneNo_key`(`phoneNo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
