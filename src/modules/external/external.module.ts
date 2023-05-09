import { Module } from '@nestjs/common';
import { InhouseModule } from '../inhouse/inhouse.module';
import { StockModule } from '../stock/stock.module';
import { WorkingModule } from '../working/working.module';
import { SalesController } from './api/sales.controller';
import { OrderService } from './service/order.service';
import { SalesChangeService } from './service/sales-change.service';
import { SalesRetriveService } from './service/sales-retrive.service';

@Module({
  imports: [InhouseModule, StockModule, WorkingModule],
  controllers: [SalesController],
  providers: [SalesChangeService, SalesRetriveService, OrderService],
  exports: [OrderService],
})
export class ExternalModule { }
