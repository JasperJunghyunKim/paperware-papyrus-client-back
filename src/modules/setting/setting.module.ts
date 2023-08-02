import { Module } from '@nestjs/common';
import { SettingAccountController } from './api/account.controller';
import { AccountRetriveService } from './service/account.retrive.service';
import { AccountChangeService } from './service/account.change.service';
import { AuthModule } from '../auth/auth.module';
import { SettingCompanyController } from './api/company.controller';
import { SettingCompanyRetriveService } from './service/company.retrive.service';
import { SettingCompanyChangeService } from './service/company.change.service';
import { SettingUserController } from './api/user.controller';
import { SettingUserRetriveService } from './service/user.retrive.service';
import { SettingUserChangeService } from './service/user.change.service';

@Module({
  imports: [AuthModule],
  controllers: [
    SettingAccountController,
    SettingCompanyController,
    SettingUserController,
  ],
  providers: [
    AccountRetriveService,
    AccountChangeService,
    SettingCompanyRetriveService,
    SettingCompanyChangeService,
    SettingUserRetriveService,
    SettingUserChangeService,
  ],
})
export class SettingModule {}
