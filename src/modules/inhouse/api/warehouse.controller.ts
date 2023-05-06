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
// import { WarehouseCreateRequest } from 'src/@shared/api/warehouse/warehouse.request';
import { WarehouseChangeService } from 'src/modules/inhouse/service/warehouse-change.service';
import { WarehouseRetriveService } from 'src/modules/inhouse/service/warehouse-retrive.service';
import {
  WarehouseListQueryDto,
  WarehouseUpdateRequestDto,
} from '../dto/warehouse.request';
import { AuthType } from 'src/modules/auth/auth.type';
import { AuthGuard } from 'src/modules/auth/auth.guard';

@Controller('inhouse/warehouse')
export class UserController {
  constructor(
    private readonly warehouseRetriveService: WarehouseRetriveService,
    private readonly warehouseChangeService: WarehouseChangeService,
  ) { }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getList(@Query() query: WarehouseListQueryDto): Promise<Array<any>> {
    return await this.warehouseRetriveService.getList(
      Number(query.skip),
      Number(query.take),
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.CREATED)
  async get(@Param('id') id: number) {
    return await this.warehouseRetriveService.getItem(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async create(@Request() req: AuthType, @Body() body: any) {
    await this.warehouseChangeService.create({
      name: body.name,
      code: body.code,
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

    if (warehouse.companyId !== req.user.companyId) {
      throw new ForbiddenException();
    }

    await this.warehouseChangeService.update(id, {
      name: body.name,
      code: body.code,
      isPublic: body.isPublic,
      address: body.address,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async delete(@Request() req: AuthType, @Param('id') id: number) {
    const warehouse = await this.warehouseRetriveService.getItem(id);

    if (warehouse.companyId !== req.user.companyId) {
      throw new ForbiddenException();
    }

    await this.warehouseChangeService.delete(id);
  }
}
