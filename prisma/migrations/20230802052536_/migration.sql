-- CreateTable
CREATE TABLE `UserFindPasswordAuth` (
    `userId` INTEGER NOT NULL,
    `authKey` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `UserFindPasswordAuth_userId_key`(`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
