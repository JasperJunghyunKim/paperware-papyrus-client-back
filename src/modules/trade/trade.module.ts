import { Module } from '@nestjs/common';
import { OrderChangeService } from './service/order-change.service';
import { OrderRetriveService } from './service/order-retrive.service';
import { OrderController } from './api/order.controller';
import { WorkingModule } from '../working/working.module';
import { StockModule } from '../stock/stock.module';
import { TradePriceValidator } from './service/trade-price.validator';
import { DepositController } from './api/deposit.controller';
import { DepositRetriveService } from './service/deposit-retrive.service';
import { DepositChangeService } from './service/deposit-change.service';
import { OrderRequestController } from './api/order-request.controller';
import { OrderRequestChangeService } from './service/order-rerquest.change.service';
import { OrderRequestRetriveService } from './service/order-rerquest.retrive.service';
import { CartController } from './api/cart.controller';
import { CartRetriveService } from './service/cart.retrive.service';
import { CartChangeService } from './service/cart.change.service';

@Module({
  imports: [WorkingModule, StockModule],
  providers: [
    OrderChangeService,
    OrderRetriveService,
    TradePriceValidator,
    DepositRetriveService,
    DepositChangeService,
    OrderRequestChangeService,
    OrderRequestRetriveService,
    CartRetriveService,
    CartChangeService,
  ],
  controllers: [
    OrderController,
    DepositController,
    OrderRequestController,
    CartController,
  ],
})
export class TradeModule {}
