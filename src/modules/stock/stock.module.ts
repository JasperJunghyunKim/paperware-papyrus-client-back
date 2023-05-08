import { Module } from '@nestjs/common';
import { StockController } from './api/stock.controller';
import { StockChangeService } from './service/stock-change.service';
import { StockQuantityCheckerService } from './service/stock-quantity-checker.service';
import { StockRetriveService } from './service/stock-retrive.service';
import { StockValidator } from './service/stock.validator';

@Module({
  controllers: [StockController],
  providers: [StockRetriveService, StockChangeService, StockValidator, StockQuantityCheckerService],
  exports: [StockQuantityCheckerService],
})
export class StockModule { }
