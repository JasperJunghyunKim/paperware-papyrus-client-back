-- AddForeignKey
ALTER TABLE `DepositEvent` ADD CONSTRAINT `DepositEvent_depositId_fkey` FOREIGN KEY (`depositId`) REFERENCES `Deposit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
