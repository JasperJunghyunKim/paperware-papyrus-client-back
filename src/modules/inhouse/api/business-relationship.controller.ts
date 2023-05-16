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
import { BusinessRelationshipChangeService } from '../service/business-relationship-change.service';
import { BusinessRelationshipRetriveService } from '../service/business-relationship-retrive.service';
import {
  BusinessRelationshipCompactListQueryDto,
  BusinessRelationshipCreateRequestDto,
  BusinessRelationshipListQueryDto,
} from './dto/business-relationship.request';
import {
  BusinessRelationshipCompactListResponse,
  BusinessRelationshipListResponse,
} from 'src/@shared/api';
import { CompanyRetriveService } from '../service/company-retrive.service';

@Controller('inhouse/business-relationship')
export class BusinessRelationshipController {
  constructor(
    private readonly retriveService: BusinessRelationshipRetriveService,
    private readonly changeService: BusinessRelationshipChangeService,
    private readonly companyRetriveService: CompanyRetriveService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getList(
    @Request() req: AuthType,
    @Query() query: BusinessRelationshipListQueryDto,
  ): Promise<BusinessRelationshipListResponse> {
    if (
      query.dstCompanyId !== req.user.companyId &&
      query.srcCompanyId !== req.user.companyId
    ) {
      throw new ForbiddenException();
    }

    const items = await this.retriveService.getList({
      skip: query.skip,
      take: query.take,
      dstCompanyId: query.dstCompanyId,
      srcCompanyId: query.srcCompanyId,
    });

    const total = await this.retriveService.getCount({
      dstCompanyId: query.dstCompanyId,
      srcCompanyId: query.srcCompanyId,
    });

    return {
      items,
      total,
    };
  }

  @Get('compact')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getCompactList(
    @Request() req: AuthType,
    @Query() query: BusinessRelationshipCompactListQueryDto,
  ): Promise<BusinessRelationshipCompactListResponse> {
    const items = await this.retriveService.getCompactList({
      skip: query.skip,
      take: query.take,
      companyId: req.user.companyId,
    });

    const total = await this.retriveService.getCompactCount({
      companyId: req.user.companyId,
    });

    return {
      items,
      total,
    };
  }

  @Get(':srcCompanyId/:dstCompanyId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async get(
    @Request() req: AuthType,
    @Param('srcCompanyId') srcCompanyId: number,
    @Param('dstCompanyId') dstCompanyId: number,
  ) {
    if (
      dstCompanyId !== req.user.companyId &&
      srcCompanyId !== req.user.companyId
    ) {
      throw new ForbiddenException();
    }

    const data = await this.retriveService.getItem({
      srcCompanyId,
      dstCompanyId,
    });

    return data;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async create(
    @Request() req: AuthType,
    @Body() body: BusinessRelationshipCreateRequestDto,
  ) {
    const company = await this.companyRetriveService.getItem(body.srcCompanyId);

    if (
      (company.managedById !== req.user.companyId &&
        body.srcCompanyId !== req.user.companyId) ||
      body.dstCompanyId === body.srcCompanyId
    ) {
      throw new ForbiddenException();
    }

    await this.changeService.create({
      srcCompanyId: body.srcCompanyId,
      dstCompanyId: body.dstCompanyId,
    });
  }
}
