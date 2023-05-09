import { Module } from '@nestjs/common';
import { PaidController } from './api/paid.controller';
import { AccountedRetriveService } from './service/accounted-retrive.service';
import { CollactedController } from './api/collacted.controller';
import { AccountedChangeService } from './service/accounted-change.service';

@Module({
  controllers: [PaidController, CollactedController],
  providers: [AccountedRetriveService, AccountedChangeService],
})
export class AccountedModule { }
