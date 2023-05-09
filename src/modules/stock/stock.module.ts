import { Module } from '@nestjs/common';
import { PartnerStockController } from './api/partner-stock.controller';
import { StockController } from './api/stock.controller';
import { PartnerStockRetriveService } from './service/paertner-stock.retrive.service';
import { StockChangeService } from './service/stock-change.service';
import { StockQuantityCheckerService } from './service/stock-quantity-checker.service';
import { StockRetriveService } from './service/stock-retrive.service';
import { StockValidator } from './service/stock.validator';

@Module({
  controllers: [StockController, PartnerStockController],
  providers: [StockRetriveService, StockChangeService, PartnerStockRetriveService, StockValidator, StockQuantityCheckerService],
  exports: [StockQuantityCheckerService],
})
export class StockModule { }
