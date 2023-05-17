import { Module } from '@nestjs/common';
import { BankAccountController } from './api/bank-account.controller';
import { BankAccountRetriveService } from './service/bank-account-retrive.service';
import { BankAccountChangeService } from './service/bank-account-change.service';

@Module({
  controllers: [BankAccountController],
  providers: [BankAccountRetriveService, BankAccountChangeService],
})
export class BankAccountModule { }
