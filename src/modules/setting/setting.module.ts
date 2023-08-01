import { Module } from '@nestjs/common';
import { SettingAccountController } from './api/account.controller';
import { AccountRetriveService } from './service/account.retrive.service';
import { AccountChangeService } from './service/account.change.service';
import { AuthModule } from '../auth/auth.module';
import { SettingCompanyController } from './api/company.controller';

@Module({
  imports: [AuthModule],
  controllers: [SettingAccountController, SettingCompanyController],
  providers: [AccountRetriveService, AccountChangeService],
})
export class SettingModule {}
