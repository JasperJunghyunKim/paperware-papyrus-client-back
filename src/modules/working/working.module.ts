import { Module } from '@nestjs/common';
import { PlanChangeService } from './service/plan-change.service';
import { PlanRetriveService } from './service/plan-retrive.service';
import { PlanController } from './api/plan.controller';
import { TaskChangeService } from './service/task-change.service';
import { TaskRetriveService } from './service/task-retrive.service';
import { TaskController } from './api/task.controller';
import { StockChangeService } from '../stock/service/stock-change.service';
import { StockValidator } from '../stock/service/stock.validator';

@Module({
  providers: [
    PlanChangeService,
    PlanRetriveService,
    TaskChangeService,
    TaskRetriveService,
    StockChangeService,
    StockValidator,
  ],
  controllers: [PlanController, TaskController],
})
export class WorkingModule {}
