import { Module } from '@nestjs/common';
import { OrderChangeService } from './service/order-change.service';
import { OrderRetriveService } from './service/order-retrive.service';
import { OrderController } from './api/order.controller';

@Module({
  providers: [OrderChangeService, OrderRetriveService],
  controllers: [OrderController],
})
export class TradeModule {}
