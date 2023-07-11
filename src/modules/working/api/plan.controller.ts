import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotImplementedException,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PlanInputListResponse } from 'src/@shared/api';
import { TaskListResponse } from 'src/@shared/api/working/task.response';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { PlanChangeService } from '../service/plan-change.service';
import { PlanRetriveService } from '../service/plan-retrive.service';
import { TaskRetriveService } from '../service/task-retrive.service';
import {
  DeleteInputStockRequestDto,
  PlanCreateRequestDto,
  PlanInputListQueryDto,
  PlanListQueryDto,
  RegisterInputStockRequestDto,
  UpdateInputStockRequestDto,
} from './dto/plan.request';
import { IdDto } from 'src/common/request';

@Controller('working/plan')
export class PlanController {
  constructor(
    private readonly planChangeService: PlanChangeService,
    private readonly planRetriveService: PlanRetriveService,
    private readonly taskRetriveService: TaskRetriveService,
  ) {}

  @Get()
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
      type: query.type,
    });

    const total = await this.planRetriveService.getPlanListCount({
      companyId: req.user.companyId,
    });

    return {
      items,
      total,
    };
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getPlanById(@Request() req: AuthType, @Param('id') id: number) {
    const plan = await this.planRetriveService.getPlanById(id);

    if (plan.company.id !== req.user.companyId) {
      throw new ForbiddenException('Not allowed');
    }

    return plan;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async createPlan(
    @Request() req: AuthType,
    @Body() body: PlanCreateRequestDto,
  ) {
    throw new NotImplementedException('내부 작업 등록은 아직 미구현입니다.');
  }

  @Get('/:id/task')
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

  @Post('/:id/start')
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

  @Post('/:id/complete')
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

  @Post('/:id/register-stock')
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
      companyId: req.user.companyId,
      planId: id,
      stockId: body.stockId,
      quantity: body.quantity,
      useRemainder: body.useRemainder,
    });

    return updatedPlan;
  }

  @Put('/:id/input-stock')
  @UseGuards(AuthGuard)
  async updateInputStock(
    @Request() req: AuthType,
    @Param() param: IdDto,
    @Body() dto: UpdateInputStockRequestDto,
  ) {
    throw new NotImplementedException();
  }

  @Delete('/:id/input-stock')
  @UseGuards(AuthGuard)
  async deleteInputStock(
    @Request() req: AuthType,
    @Param() param: IdDto,
    @Body() dto: DeleteInputStockRequestDto,
  ) {
    throw new NotImplementedException();
  }

  @Get('/:id/input-stock')
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
