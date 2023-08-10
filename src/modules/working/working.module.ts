import { Module, forwardRef } from '@nestjs/common';
import { StockModule } from '../stock/stock.module';
import { PlanController } from './api/plan.controller';
import { TaskController } from './api/task.controller';
import { PlanChangeService } from './service/plan-change.service';
import { PlanRetriveService } from './service/plan-retrive.service';
import { TaskChangeService } from './service/task-change.service';
import { TaskRetriveService } from './service/task-retrive.service';
import { TradeModule } from '../trade/trade.module';

@Module({
  imports: [StockModule],
  providers: [
    PlanChangeService,
    PlanRetriveService,
    TaskChangeService,
    TaskRetriveService,
  ],
  controllers: [PlanController, TaskController],
  exports: [PlanChangeService],
})
export class WorkingModule {}
