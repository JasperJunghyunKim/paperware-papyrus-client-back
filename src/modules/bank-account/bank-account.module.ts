import { Module } from '@nestjs/common';
import { BankAccountController } from './api/bank-account.controller';
import { BankAccountRetriveService } from './service/bank-account-retrive.service';

@Module({
  controllers: [BankAccountController],
  providers: [BankAccountRetriveService],
})
export class BankAccountModule { }
