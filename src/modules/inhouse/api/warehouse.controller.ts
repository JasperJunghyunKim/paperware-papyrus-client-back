/* eslint-disable prettier/prettier */
import {
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
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { WarehouseCreateRequest } from 'src/@shared/api/inhouse/warehouse.request';
import { WarehouseChangeService } from 'src/modules/inhouse/service/warehouse-change.service';
import { WarehouseRetriveService } from 'src/modules/inhouse/service/warehouse-retrive.service';
import {
  WarehouseListQueryDto,
  WarehouseUpdateRequestDto,
} from './dto/warehouse.request';
import { AuthType } from 'src/modules/auth/auth.type';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { WarehouseListResponse } from 'src/@shared/api';

@Controller('inhouse/warehouse')
export class WarehouseController {
  constructor(
    private readonly warehouseRetriveService: WarehouseRetriveService,
    private readonly warehouseChangeService: WarehouseChangeService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getList(
    @Request() req: AuthType,
    @Query() query: WarehouseListQueryDto,
  ): Promise<WarehouseListResponse> {
    const items = await this.warehouseRetriveService.getList({
      skip: query.skip,
      take: query.take,
      companyId: req.user.companyId,
    });

    const total = await this.warehouseRetriveService.getCount({
      companyId: req.user.companyId,
    });

    return {
      items,
      total,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async get(@Request() req: AuthType, @Param('id') id: number) {
    const warehouse = await this.warehouseRetriveService.getItem(id);

    if (warehouse.company.id !== req.user.companyId) {
      throw new ForbiddenException();
    }

    return warehouse;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async create(@Request() req: AuthType, @Body() body: any) {
    await this.warehouseChangeService.create({
      name: body.name,
      isPublic: body.isPublic,
      address: body.address,
      company: {
        connect: {
          id: req.user.companyId,
        },
      },
    });
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async update(
    @Request() req: AuthType,
    @Param('id') id: number,
    @Body() body: WarehouseUpdateRequestDto,
  ) {
    const warehouse = await this.warehouseRetriveService.getItem(id);

    if (warehouse.company.id !== req.user.companyId) {
      throw new ForbiddenException();
    }

    await this.warehouseChangeService.update(id, {
      name: body.name,
      isPublic: body.isPublic,
      address: body.address,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async delete(@Request() req: AuthType, @Param('id') id: number) {
    const warehouse = await this.warehouseRetriveService.getItem(id);

    if (warehouse.company.id !== req.user.companyId) {
      throw new ForbiddenException();
    }

    await this.warehouseChangeService.delete(id);
  }
}
