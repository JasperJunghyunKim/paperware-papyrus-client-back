import { Module } from '@nestjs/common';
import { AccountedRetriveService } from './service/accounted-retrive.service';
import { AccountedController } from './api/accounted.controller';
import { AccountedChangeService } from './service/accounted-change.service';
import { InhouseModule } from '../inhouse/inhouse.module';

@Module({
  imports: [InhouseModule],
  controllers: [AccountedController],
  providers: [AccountedRetriveService, AccountedChangeService],
})
export class AccountedModule {}
