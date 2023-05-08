import { Module } from '@nestjs/common';
import { InhouseModule } from '../inhouse/inhouse.module';
import { StockModule } from '../stock/stock.module';
import { SalesController } from './api/sales.controller';
import { SalesChangeService } from './service/sales-change.service';
import { SalesRetriveService } from './service/sales-retrive.service';

@Module({
  imports: [InhouseModule, StockModule],
  controllers: [SalesController],
  providers: [SalesChangeService, SalesRetriveService],
})
export class ExternalModule { }
