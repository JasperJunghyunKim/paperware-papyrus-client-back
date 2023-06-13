import { Module } from '@nestjs/common';
import { PartnerStockController } from './api/partner-stock.controller';
import { StockController } from './api/stock.controller';
import { StockChangeService } from './service/stock-change.service';
import { StockRetriveService } from './service/stock-retrive.service';
import { StockValidator } from './service/stock.validator';
import { PlanChangeService } from './service/plan-change.service';
import { PartnerStockRetriveService } from './service/paertner-stock.retrive.service';
import { StockArrivalController } from './api/stock-arrival.controller';
import { StockArrivalRetriveService } from './service/stock-arrival-retrive.service';
import { StockArrivalChangeService } from './service/stock-arrival-change.service';
import { StockQuantityChecker } from './service/stock-quantity-checker';

@Module({
  controllers: [
    StockController,
    StockArrivalController,
    PartnerStockController,
  ],
  providers: [
    StockRetriveService,
    StockChangeService,
    StockValidator,
    StockArrivalRetriveService,
    StockArrivalChangeService,
    PartnerStockRetriveService,
    PlanChangeService,
    StockQuantityChecker,
  ],
  exports: [StockChangeService, StockValidator, StockQuantityChecker],
})
export class StockModule { }
