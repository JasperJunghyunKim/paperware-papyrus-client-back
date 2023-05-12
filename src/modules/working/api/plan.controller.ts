import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { PlanChangeService } from '../service/plan-change.service';
import { PlanRetriveService } from '../service/plan-retrive.service';
import {
  PlanCreateRequestDto,
  PlanInputListQueryDto,
  PlanListQueryDto,
  RegisterInputStockRequestDto,
} from './dto/plan.request';
import { TaskRetriveService } from '../service/task-retrive.service';
import { TaskListResponse } from 'src/@shared/api/working/task.response';
import { query } from 'express';
import {
  PlanInputListQuery,
  PlanInputListResponse,
  PlanListResponse,
} from 'src/@shared/api';

@Controller('working')
export class PlanController {
  constructor(
    private readonly planChangeService: PlanChangeService,
    private readonly planRetriveService: PlanRetriveService,
    private readonly taskRetriveService: TaskRetriveService,
  ) {}

  @Get('plan')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getPlanList(
    @Request() req: AuthType,
    @Query() query: PlanListQueryDto,
  ) {
    const items = await this.planRetriveService.getPlanList({
      skip: query.skip,
      take: query.take,
      companyId: req.user.companyId,
    });

    const total = await this.planRetriveService.getPlanListCount({
      companyId: req.user.companyId,
    });

    return {
      items,
      total,
    };
  }

  @Get('plan/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getPlanById(@Request() req: AuthType, @Param('id') id: number) {
    const plan = await this.planRetriveService.getPlanById(id);

    if (plan.company.id !== req.user.companyId) {
      throw new ForbiddenException('Not allowed');
    }

    return plan;
  }

  @Post('plan')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async createPlan(
    @Request() req: AuthType,
    @Body() body: PlanCreateRequestDto,
  ) {
    const plan = await this.planChangeService.createPlan({
      ...body,
      companyId: req.user.companyId,
    });

    return plan;
  }

  @Get('plan/:id/task')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getTaskListByPlanId(
    @Request() req: AuthType,
    @Param('id') id: number,
  ): Promise<TaskListResponse> {
    const plan = await this.planRetriveService.getPlanById(id);

    if (plan.company.id !== req.user.companyId) {
      throw new ForbiddenException('Not allowed');
    }

    const tasks = await this.taskRetriveService.getTaskList({
      planId: id,
    });

    return tasks;
  }

  @Post('plan/:id/start')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async forwardPlan(@Request() req: AuthType, @Param('id') id: number) {
    const plan = await this.planRetriveService.getPlanById(id);

    if (plan.company.id !== req.user.companyId) {
      throw new ForbiddenException('Not allowed');
    }

    const updatedPlan = await this.planChangeService.startPlan({
      planId: id,
    });

    return updatedPlan;
  }

  @Post('plan/:id/complete')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async completePlan(@Request() req: AuthType, @Param('id') id: number) {
    const plan = await this.planRetriveService.getPlanById(id);

    if (plan.company.id !== req.user.companyId) {
      throw new ForbiddenException('Not allowed');
    }

    const updatedPlan = await this.planChangeService.completePlan({
      planId: id,
    });

    return updatedPlan;
  }

  @Post('plan/:id/register-stock')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async registerStock(
    @Request() req: AuthType,
    @Param('id') id: number,
    @Body() body: RegisterInputStockRequestDto,
  ) {
    const plan = await this.planRetriveService.getPlanById(id);

    if (plan.company.id !== req.user.companyId) {
      throw new ForbiddenException('Not allowed');
    }

    const updatedPlan = await this.planChangeService.registerInputStock({
      planId: id,
      stockId: body.stockId,
      quantity: body.quantity,
    });

    return updatedPlan;
  }

  @Get('plan/:id/input-stock')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getInputStockListByPlanId(
    @Request() req: AuthType,
    @Param('id') id: number,
    @Query() query: PlanInputListQueryDto,
  ): Promise<PlanInputListResponse> {
    const plan = await this.planRetriveService.getPlanById(id);

    if (plan.company.id !== req.user.companyId) {
      throw new ForbiddenException('Not allowed');
    }

    const items = await this.planRetriveService.getPlanInputList({
      planId: id,
      skip: query.skip,
      take: query.take,
    });

    const total = await this.planRetriveService.getPlanInputCount({
      planId: id,
    });

    return {
      items,
      total,
    };
  }
}
