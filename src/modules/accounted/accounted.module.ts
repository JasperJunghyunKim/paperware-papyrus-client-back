import { Module } from '@nestjs/common';
import { AccountedChangeService } from './service/accounted-change.service';
import { AccountedRetriveService } from './service/accounted-retrive.service';
import { AccountedController } from './api/accounted.controller';

@Module({
  controllers: [AccountedController],
  providers: [AccountedRetriveService, AccountedChangeService],
})
export class AccountedModule { }
