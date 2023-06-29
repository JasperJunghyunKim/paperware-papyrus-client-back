import { Module } from '@nestjs/common';
import { AccountedRetriveService } from './service/accounted-retrive.service';
import { AccountedController } from './api/accounted.controller';
import { ByCashController } from './api/by-cash.controller';
import { ByEtcController } from './api/by-etc.controller';
import { ByCashRetriveService } from './service/by-cash-retrive.service';
import { ByEtcRetriveService } from './service/by-etc-retrive.service';
import { ByCashChangeService } from './service/by-cash-change.service';
import { ByEtcChangeService } from './service/by-etc-change.service';
import { ByBankAccountController } from './api/by-bank-account.controller';
import { ByCardController } from './api/by-card.controller';
import { ByOffsetController } from './api/by-offset.controller';
import { ByCardChangeService } from './service/by-card-change.service';
import { ByCardRetriveService } from './service/by-card-retrive.service';
import { ByBankAccountRetriveService } from './service/by-bank-account-retrive.service';
import { ByBankAccountChangeService } from './service/by-bank-account-change.service';
import { ByOffsetChangeService } from './service/by-offset-change.service';
import { ByOffsetRetriveService } from './service/by-offset-retrive.service';
import { BySecurityController } from './api/by-security.controller';
import { BySecurityChangeService } from './service/by-security-change.service';
import { BySecurityRetriveService } from './service/by-security-retrive.service';

@Module({
  controllers: [
    AccountedController,
    ByCashController,
    ByEtcController,
    ByBankAccountController,
    ByCardController,
    ByOffsetController,
    BySecurityController,
  ],
  providers: [
    AccountedRetriveService,
    ByCashRetriveService,
    ByCashChangeService,
    ByEtcRetriveService,
    ByEtcChangeService,
    ByCardRetriveService,
    ByCardChangeService,
    ByBankAccountRetriveService,
    ByBankAccountChangeService,
    ByOffsetRetriveService,
    ByOffsetChangeService,
    BySecurityRetriveService,
    BySecurityChangeService,
  ],
})
export class AccountedModule {}
