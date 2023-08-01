-- CreateTable
CREATE TABLE `AuthenticationLog` (
    `id` BIGINT NOT NULL,
    `phoneNo` VARCHAR(191) NOT NULL,
    `authNo` VARCHAR(191) NOT NULL,
    `authKey` VARCHAR(191) NOT NULL,
    `inputAuthNo` VARCHAR(191) NULL,
    `inputAuthKey` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `AuthenticationLog_id_key`(`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
