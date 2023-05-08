import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TaskItemResponse } from 'src/@shared/api/working/task.response';
import { Util } from 'src/common';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { PlanRetriveService } from '../service/plan-retrive.service';
import { TaskChangeService } from '../service/task-change.service';
import { TaskRetriveService } from '../service/task-retrive.service';
import {
  TaskCreateConvertingRequestDto,
  TaskCreateGuillotineRequestDto,
  TaskCreateQuantityRequestDto,
  TaskInsertInputStockRequestDto,
  TaskUpdateConvertingRequestDto,
  TaskUpdateGuillotineRequestDto,
  TaskUpdateQuantityRequestDto,
} from './dto/task.request';

@Controller('working')
export class TaskController {
  constructor(
    private readonly taskRetriveService: TaskRetriveService,
    private readonly taskChangeService: TaskChangeService,
    private readonly planRetriveService: PlanRetriveService,
  ) {}

  @Get('task/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getTaskById(
    @Request() req: AuthType,
    @Param('id') id: number,
  ): Promise<TaskItemResponse> {
    const task = await this.taskRetriveService.getTaskById(id);

    if (task.plan.company.id !== req.user.companyId) {
      throw new ForbiddenException('Not allowed');
    }

    return task;
  }

  @Post('task/converting')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async createTaskConverting(
    @Request() req: AuthType,
    @Body() body: TaskCreateConvertingRequestDto,
  ) {
    const plan = await this.planRetriveService.getPlanById(body.planId);

    if (plan.company.id !== req.user.companyId) {
      throw new ForbiddenException('Not allowed');
    }

    if (plan.status !== 'PREPARING') {
      throw new BadRequestException('수정할 수 없는 상태입니다.');
    }

    if (body.parentTaskId) {
      const parentTask = await this.taskRetriveService.getTaskById(
        body.parentTaskId,
      );

      if (parentTask.plan.id !== plan.id) {
        throw new ForbiddenException('Not allowed');
      }

      if (!Util.inc(parentTask.type)) {
        throw new BadRequestException('Not allowed');
      }
    }

    const task = await this.taskChangeService.createConvertingTask({
      planId: body.planId,
      sizeX: body.sizeX,
      sizeY: body.sizeY,
      memo: body.memo,
      parentTaskId: body.parentTaskId ?? null,
    });

    return task;
  }

  @Post('task/guillotine')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async createTaskGuillotine(
    @Request() req: AuthType,
    @Body() body: TaskCreateGuillotineRequestDto,
  ) {
    const plan = await this.planRetriveService.getPlanById(body.planId);

    if (plan.company.id !== req.user.companyId) {
      throw new ForbiddenException('Not allowed');
    }

    if (plan.status !== 'PREPARING') {
      throw new BadRequestException('수정할 수 없는 상태입니다.');
    }

    if (body.parentTaskId) {
      const parentTask = await this.taskRetriveService.getTaskById(
        body.parentTaskId,
      );

      if (parentTask.plan.id !== plan.id) {
        throw new ForbiddenException('Not allowed');
      }

      if (!Util.inc(parentTask.type, 'CONVERTING')) {
        throw new BadRequestException('Not allowed');
      }
    }

    const task = await this.taskChangeService.createGuillotineTask({
      planId: body.planId,
      sizeX: body.sizeX,
      sizeY: body.sizeY,
      memo: body.memo,
      parentTaskId: body.parentTaskId ?? null,
    });

    return task;
  }

  @Post('task/quantity')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async createTaskQuantity(
    @Request() req: AuthType,
    @Body() body: TaskCreateQuantityRequestDto,
  ) {
    const plan = await this.planRetriveService.getPlanById(body.planId);

    if (plan.company.id !== req.user.companyId) {
      throw new ForbiddenException('Not allowed');
    }

    if (plan.status !== 'PREPARING') {
      throw new BadRequestException('수정할 수 없는 상태입니다.');
    }

    const task = await this.taskChangeService.createQuantityTask({
      planId: body.planId,
      quantity: body.quantity,
      parentTaskId: body.parentTaskId ?? null,
    });

    return task;
  }

  @Put('task/converting/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async updateTaskConverting(
    @Request() req: AuthType,
    @Param('id') id: number,
    @Body() body: TaskUpdateConvertingRequestDto,
  ) {
    const task = await this.taskRetriveService.getTaskById(id);

    if (task.plan.company.id !== req.user.companyId) {
      throw new ForbiddenException('Not allowed');
    }

    if (task.type !== 'CONVERTING') {
      throw new BadRequestException('Not allowed');
    }

    if (task.plan.status !== 'PREPARING') {
      throw new BadRequestException('수정할 수 없는 상태입니다.');
    }

    const updatedTask = await this.taskChangeService.updateConvertingTask({
      id: task.id,
      sizeX: body.sizeX,
      sizeY: body.sizeY,
      memo: body.memo,
    });

    return updatedTask;
  }

  @Put('task/guillotine/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async updateTaskGuillotine(
    @Request() req: AuthType,
    @Param('id') id: number,
    @Body() body: TaskUpdateGuillotineRequestDto,
  ) {
    const task = await this.taskRetriveService.getTaskById(id);

    if (task.plan.company.id !== req.user.companyId) {
      throw new ForbiddenException('Not allowed');
    }

    if (task.type !== 'GUILLOTINE') {
      throw new BadRequestException('Not allowed');
    }

    if (task.plan.status !== 'PREPARING') {
      throw new BadRequestException('수정할 수 없는 상태입니다.');
    }

    const updatedTask = await this.taskChangeService.updateGuillotineTask({
      id: task.id,
      sizeX: body.sizeX,
      sizeY: body.sizeY,
      memo: body.memo,
    });

    return updatedTask;
  }

  @Put('task/quantity/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async updateTaskQuantity(
    @Request() req: AuthType,
    @Param('id') id: number,
    @Body() body: TaskUpdateQuantityRequestDto,
  ) {
    const task = await this.taskRetriveService.getTaskById(id);

    if (task.plan.company.id !== req.user.companyId) {
      throw new ForbiddenException('Not allowed');
    }

    if (task.type !== 'QUANTITY') {
      throw new BadRequestException('Not allowed');
    }

    if (task.plan.status !== 'PREPARING') {
      throw new BadRequestException('수정할 수 없는 상태입니다.');
    }

    const updatedTask = await this.taskChangeService.updateQuantityTask({
      id: task.id,
      quantity: body.quantity,
    });

    return updatedTask;
  }

  @Delete('task/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async deleteTask(@Request() req: AuthType, @Param('id') id: number) {
    const task = await this.taskRetriveService.getTaskById(id);

    if (task.plan.company.id !== req.user.companyId) {
      throw new ForbiddenException('Not allowed');
    }

    if (task.plan.status !== 'PREPARING') {
      throw new BadRequestException('삭제할 수 없는 상태입니다.');
    }

    await this.taskChangeService.deleteTask(id);

    return;
  }

  @Post('task/:id/start')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async startTask(@Request() req: AuthType, @Param('id') id: number) {
    const task = await this.taskRetriveService.getTaskById(id);

    if (task.plan.company.id !== req.user.companyId) {
      throw new ForbiddenException('Not allowed');
    }

    await this.taskChangeService.startTask(id);

    return;
  }

  @Post('task/:id/reset')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async resetTask(@Request() req: AuthType, @Param('id') id: number) {
    const task = await this.taskRetriveService.getTaskById(id);

    if (task.plan.company.id !== req.user.companyId) {
      throw new ForbiddenException('Not allowed');
    }

    await this.taskChangeService.resetTask(id);

    return;
  }

  @Post('task/:id/finish')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async finishTask(@Request() req: AuthType, @Param('id') id: number) {
    const task = await this.taskRetriveService.getTaskById(id);

    if (task.plan.company.id !== req.user.companyId) {
      throw new ForbiddenException('Not allowed');
    }

    await this.taskChangeService.finishTask(id);

    return;
  }

  @Post('task/:id/input-stock')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async inputStockTask(
    @Request() req: AuthType,
    @Param('id') id: number,
    @Body() body: TaskInsertInputStockRequestDto,
  ) {
    const task = await this.taskRetriveService.getTaskById(id);

    if (task.plan.company.id !== req.user.companyId) {
      throw new ForbiddenException('Not allowed');
    }

    await this.taskChangeService.insertInputStock({
      taskId: id,
      stockId: body.stockId,
      quantity: body.quantity,
    });

    return;
  }
}
