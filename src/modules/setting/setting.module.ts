import { Module } from '@nestjs/common';
import { AccountController } from './api/account.controller';
import { AccountRetriveService } from './service/account.retrive.service';
import { AccountChangeService } from './service/account.change.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AccountController],
  providers: [AccountRetriveService, AccountChangeService],
})
export class SettingModule {}
