import { Module } from '@nestjs/common';
import { CollectedController } from './api/collected.controller';
import { PaidController } from './api/paid.controller';
import { AccountedChangeService } from './service/accounted-change.service';
import { AccountedRetriveService } from './service/accounted-retrive.service';

@Module({
  controllers: [PaidController, CollectedController],
  providers: [AccountedRetriveService, AccountedChangeService],
})
export class AccountedModule { }
