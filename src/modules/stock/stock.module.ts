import { Module } from '@nestjs/common';
import { PartnerStockController } from './api/partner-stock.controller';
import { StockController } from './api/stock.controller';
import { PartnerStockRetriveService } from './service/paertner-stock.retrive.service';
import { StockChangeService } from './service/stock-change.service';
import { StockQuantityCheckerService } from './service/stock-quantity-checker.service';
import { StockRetriveService } from './service/stock-retrive.service';
import { StockValidator } from './service/stock.validator';
import { StockArrivalController } from './api/stock-arrival.controller';
import { StockArrivalRetriveService } from './service/stock-arrival-retrive.service';
import { StockArrivalChangeService } from './service/stock-arrival-change.service';

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
    StockQuantityCheckerService,
    StockArrivalRetriveService,
    StockArrivalChangeService,
    PartnerStockRetriveService,
  ],
  exports: [StockQuantityCheckerService, StockChangeService, StockValidator],
})
export class StockModule {}
