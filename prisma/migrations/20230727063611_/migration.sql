-- AlterTable
ALTER TABLE `Invoice` MODIFY `invoiceStatus` ENUM('WAIT_LOADING', 'WAIT_SHIPPING', 'ON_SHIPPING', 'DONE_SHIPPING', 'CANCELLED') NOT NULL DEFAULT 'WAIT_LOADING';
