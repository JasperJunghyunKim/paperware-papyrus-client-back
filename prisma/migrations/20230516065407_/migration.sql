-- AlterTable
ALTER TABLE `Invoice` ADD COLUMN `invoiceStatus` ENUM('WAIT_LOADING', 'WAIT_SHIPPING', 'ON_SHIPPING', 'DONE_SHIPPING') NOT NULL DEFAULT 'WAIT_LOADING';
