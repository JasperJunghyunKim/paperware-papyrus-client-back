/*
  Warnings:

  - Added the required column `companyId` to the `OrderStock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grammage` to the `OrderStock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `packagingId` to the `OrderStock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `OrderStock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `OrderStock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sizeX` to the `OrderStock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sizeY` to the `OrderStock` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `OrderStock` ADD COLUMN `companyId` INTEGER NOT NULL,
    ADD COLUMN `grammage` INTEGER NOT NULL,
    ADD COLUMN `packagingId` INTEGER NOT NULL,
    ADD COLUMN `paperCertId` INTEGER NULL,
    ADD COLUMN `paperColorGroupId` INTEGER NULL,
    ADD COLUMN `paperColorId` INTEGER NULL,
    ADD COLUMN `paperPatternId` INTEGER NULL,
    ADD COLUMN `planId` INTEGER NULL,
    ADD COLUMN `productId` INTEGER NOT NULL,
    ADD COLUMN `quantity` INTEGER NOT NULL,
    ADD COLUMN `sizeX` INTEGER NOT NULL,
    ADD COLUMN `sizeY` INTEGER NOT NULL,
    ADD COLUMN `warehouseId` INTEGER NULL;
