import { Module } from '@nestjs/common';
import { PartnerController } from './api/partner.controller';
import { PartnerRetriveService } from './service/partner-retrive.service';

@Module({
  controllers: [PartnerController],
  providers: [PartnerRetriveService],
})
export class PartnerModule { }
