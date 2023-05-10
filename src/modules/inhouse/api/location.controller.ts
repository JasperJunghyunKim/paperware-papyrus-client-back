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
import { LocationCreateRequest } from 'src/@shared/api/inhouse/location.request';
import { LocationChangeService } from 'src/modules/inhouse/service/location-change.service';
import { LocationRetriveService } from 'src/modules/inhouse/service/location-retrive.service';
import {
  LocationForSalesListQueryDto,
  LocationListQueryDto,
  LocationUpdateRequestDto,
} from './dto/location.request';
import { AuthType } from 'src/modules/auth/auth.type';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { LocationListResponse } from 'src/@shared/api';

@Controller('inhouse/location')
export class LocationController {
  constructor(
    private readonly locationRetriveService: LocationRetriveService,
    private readonly locationChangeService: LocationChangeService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getList(
    @Request() req: AuthType,
    @Query() query: LocationListQueryDto,
  ): Promise<LocationListResponse> {
    const items = await this.locationRetriveService.getList({
      skip: query.skip,
      take: query.take,
      companyId: req.user.companyId,
    });

    const total = await this.locationRetriveService.getCount({
      companyId: req.user.companyId,
    });

    return {
      items,
      total,
    };
  }

  @Get('for-sales')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getListForSales(
    @Request() req: AuthType,
    @Query() query: LocationForSalesListQueryDto,
  ): Promise<LocationListResponse> {
    console.log(query);
    const items = await this.locationRetriveService.getListForSales({
      skip: query.skip,
      take: query.take,
      companyId: req.user.companyId,
      targetCompanyId: query.targetCompanyId,
    });

    const total = await this.locationRetriveService.getCountForSales({
      companyId: req.user.companyId,
      targetCompanyId: query.targetCompanyId,
    });

    return {
      items,
      total,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async get(@Request() req: AuthType, @Param('id') id: number) {
    const location = await this.locationRetriveService.getItem(id);

    if (location.company.id !== req.user.companyId) {
      throw new ForbiddenException();
    }

    return location;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async create(@Request() req: AuthType, @Body() body: LocationCreateRequest) {
    await this.locationChangeService.create({
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
    @Body() body: LocationUpdateRequestDto,
  ) {
    const location = await this.locationRetriveService.getItem(id);

    if (location.company.id !== req.user.companyId) {
      throw new ForbiddenException();
    }

    await this.locationChangeService.update(id, {
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
    const location = await this.locationRetriveService.getItem(id);

    if (location.company.id !== req.user.companyId) {
      throw new ForbiddenException();
    }

    await this.locationChangeService.delete(id);
  }
}
