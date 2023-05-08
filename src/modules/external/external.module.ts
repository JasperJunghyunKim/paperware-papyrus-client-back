import { Module } from '@nestjs/common';
import { SalesController } from './api/sales.controller';
import { SalesChangeService } from './service/sales-change.service';
import { SalesRetriveService } from './service/sales-retrive.service';

@Module({
  controllers: [SalesController],
  providers: [SalesChangeService, SalesRetriveService],
})
export class ExternalModule { }
