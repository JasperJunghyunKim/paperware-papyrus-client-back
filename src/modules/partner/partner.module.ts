import { Module } from '@nestjs/common';
import { PartnerController } from './api/partner.controller';
import { PartnerRetriveService } from './service/partner-retrive.service';
import { PartnerChangeSerivce } from './service/partner-change.service';

@Module({
  controllers: [PartnerController],
  providers: [PartnerRetriveService, PartnerChangeSerivce],
})
export class PartnerModule {}
