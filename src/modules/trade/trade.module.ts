import { Module } from '@nestjs/common';
import { OrderChangeService } from './service/order-change.service';
import { OrderRetriveService } from './service/order-retrive.service';
import { OrderController } from './api/order.controller';
import { PlanChangeService } from '../working/service/plan-change.service';

@Module({
  providers: [OrderChangeService, OrderRetriveService, PlanChangeService],
  controllers: [OrderController],
})
export class TradeModule {}
