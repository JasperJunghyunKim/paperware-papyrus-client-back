import { Module } from '@nestjs/common';
import { AccountedRetriveService } from './service/accounted-retrive.service';
import { AccountedController } from './api/accounted.controller';
import { ByCashController } from './api/by-cash.controller';
import { ByEtcController } from './api/by-etc.controller';
import { ByCashRetriveService } from './service/by-cash-retrive.service';
import { ByEtcRetriveService } from './service/by-etc-retrive.service';
import { ByCashChangeService } from './service/by-cash-change.service';
import { ByEtcChangeService } from './service/by-etc-change.service';

@Module({
  controllers: [
    AccountedController,
    ByCashController,
    ByEtcController,
  ],
  providers: [
    AccountedRetriveService,
    ByCashRetriveService,
    ByCashChangeService,
    ByEtcRetriveService,
    ByEtcChangeService,
  ],
})
export class AccountedModule { }
