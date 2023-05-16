import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  BusinessRelationshipRequestListResponse,
  BusinessRelationshipRequestPendingCountResponse,
} from 'src/@shared/api';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { BusinessRelationshipRequestChangeService } from '../service/business-relationship-request-change.service';
import { BusinessRelationshipRequestRetriveService } from '../service/business-relationship-request-retrive.service';
import {
  BusinessRelationshipRequestAcceptRequestDto,
  BusinessRelationshipRequestCreateRequestDto,
  BusinessRelationshipRequestListQueryDto,
  BusinessRelationshipRequestRejectRequestDto,
} from './dto/business-relationship-request.request';

@Controller('inhouse/business-relationship-request')
export class BusinessRelationshipRequestRequestController {
  constructor(
    private readonly retriveService: BusinessRelationshipRequestRetriveService,
    private readonly changeService: BusinessRelationshipRequestChangeService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getList(
    @Request() req: AuthType,
    @Query() query: BusinessRelationshipRequestListQueryDto,
  ): Promise<BusinessRelationshipRequestListResponse> {
    const items = await this.retriveService.getList({
      skip: query.skip,
      take: query.take,
      dstCompanyId: req.user.companyId,
    });

    const total = await this.retriveService.getCount({
      dstCompanyId: req.user.companyId,
    });

    return {
      items,
      total,
    };
  }

  @Get('pending-count')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getPendingCount(
    @Request() req: AuthType,
  ): Promise<BusinessRelationshipRequestPendingCountResponse> {
    const value = await this.retriveService.getCount({
      dstCompanyId: req.user.companyId,
    });

    return {
      value,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async create(
    @Request() req: AuthType,
    @Body() body: BusinessRelationshipRequestCreateRequestDto,
  ) {
    await this.changeService.upsert({
      srcCompanyId: req.user.companyId,
      dstCompanyId: body.companyId,
      isPurchase: body.isPurchase,
      isSales: body.isSales,
    });
  }

  @Post('accept')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async accept(
    @Request() req: AuthType,
    @Body() body: BusinessRelationshipRequestAcceptRequestDto,
  ) {
    await this.changeService.accept({
      srcCompanyId: body.companyId,
      dstCompanyId: req.user.companyId,
    });
  }

  @Post('reject')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async reject(
    @Request() req: AuthType,
    @Body() body: BusinessRelationshipRequestRejectRequestDto,
  ) {
    await this.changeService.reject({
      srcCompanyId: body.companyId,
      dstCompanyId: req.user.companyId,
    });
  }
}
