-- CreateTable
CREATE TABLE `UserMenu` (
    `userId` INTEGER NOT NULL,
    `menu` TEXT NOT NULL,

    UNIQUE INDEX `UserMenu_userId_key`(`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserMenu` ADD CONSTRAINT `UserMenu_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
