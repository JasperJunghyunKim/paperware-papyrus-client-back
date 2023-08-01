import { Module } from '@nestjs/common';
import { AccountController } from './api/account.controller';
import { AccountRetriveService } from './service/account.retrive.service';
import { AccountChangeService } from './service/account.change.service';

@Module({
  imports: [],
  controllers: [AccountController],
  providers: [AccountRetriveService, AccountChangeService],
})
export class SettingModule {}
