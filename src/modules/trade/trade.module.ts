import { Module } from '@nestjs/common';
import { OrderChangeService } from './service/order-change.service';
import { OrderRetriveService } from './service/order-retrive.service';
import { OrderController } from './api/order.controller';
import { PlanChangeService } from '../working/service/plan-change.service';
import { WorkingModule } from '../working/working.module';
import { StockModule } from '../stock/stock.module';

@Module({
  imports: [WorkingModule, StockModule],
  providers: [OrderChangeService, OrderRetriveService],
  controllers: [OrderController],
})
export class TradeModule { }
