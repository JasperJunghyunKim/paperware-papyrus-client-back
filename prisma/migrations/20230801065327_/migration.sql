/*
  Warnings:

  - Added the required column `type` to the `AuthenticationLog` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `AuthenticationLog_id_key` ON `AuthenticationLog`;

-- AlterTable
ALTER TABLE `AuthenticationLog` ADD COLUMN `type` ENUM('CREATE', 'AUTH_NO', 'AUTH_KEY') NOT NULL,
    MODIFY `id` BIGINT NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);
