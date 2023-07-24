-- AlterTable
ALTER TABLE `Company` ADD COLUMN `companyType` ENUM('DISTRIBUTOR', 'MANUFACTURER', 'PRACTICAL', 'ETC') NOT NULL DEFAULT 'ETC',
    ADD COLUMN `corporateRegistrationNumber` VARCHAR(191) NULL,
    ADD COLUMN `memo` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `startDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `Manufacturer` ADD COLUMN `isDiscontinued` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `OrderRequest` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `PaperCert` ADD COLUMN `isDiscontinued` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `PaperColor` ADD COLUMN `isDiscontinued` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `PaperColorGroup` ADD COLUMN `isDiscontinued` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `PaperDomain` ADD COLUMN `isDiscontinued` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `PaperGroup` ADD COLUMN `isDiscontinued` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `PaperPattern` ADD COLUMN `isDiscontinued` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `PaperType` ADD COLUMN `isDiscontinued` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Product` ADD COLUMN `isDiscontinued` BOOLEAN NOT NULL DEFAULT false;
