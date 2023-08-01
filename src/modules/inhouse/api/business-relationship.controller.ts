import {
  Body,
  Controller,
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
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { BusinessRelationshipChangeService } from '../service/business-relationship-change.service';
import { BusinessRelationshipRetriveService } from '../service/business-relationship-retrive.service';
import {
  BusinessRelationshipCompactListQueryDto,
  BusinessRelationshipCreateRequestDto,
  BusinessRelationshipListQueryDto,
  BusinessRelationshipReqeustRequestDto,
  RegisterPartnerRequestDto,
  SearchPartnerRequestDto,
  UpsertPartnerRequestDto,
} from './dto/business-relationship.request';
import {
  BusinessRelationshipCompactListResponse,
  BusinessRelationshipListResponse,
  SearchPartnerResponse,
} from 'src/@shared/api';
import { CompanyRetriveService } from '../service/company-retrive.service';
import { Util } from 'src/common';

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
      items: Util.serialize(items),
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

  @Get('compact/:companyId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getCompactItem(
    @Request() req: AuthType,
    @Param('companyId') companyId: number,
  ) {
    const data = await this.retriveService.getCompactItem({
      companyId: req.user.companyId,
      targetCompanyId: companyId,
    });

    return data;
  }

  @Put('partner/:companyRegistrationNumber')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async upsertPartner(
    @Request() req: AuthType,
    @Param('companyRegistrationNumber') companyRegistrationNumber: string,
    @Body() body: UpsertPartnerRequestDto,
  ) {
    await this.changeService.upsertPartner({
      companyId: req.user.companyId,
      companyRegistrationNumber,
      partnerNickname: body.partnerNickname,
      creditLimit: body.creditLimit,
      memo: body.memo,
    });
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

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async register(
    @Request() req: AuthType,
    @Body() body: RegisterPartnerRequestDto,
  ) {
    body.validate();
    await this.changeService.register({
      srcCompanyId: req.user.companyId,
      create: body.create,
      invoiceCode: body.invoiceCode,
      bizType: body.bizType,
      bizItem: body.bizItem,
      partnerNickname: body.partnerNickname,
      businessName: body.businessName,
      type: body.type,
      address: body.address,
      phoneNo: body.phoneNo,
      faxNo: body.faxNo,
      representative: body.representative,
      companyRegistrationNumber: body.companyRegistrationNumber,
      creditLimit: body.creditLimit,
      memo: body.memo,
      partnerTaxManager: body.partnerTaxManager,
    });
  }

  @Post('request')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async request(
    @Request() req: AuthType,
    @Body() body: BusinessRelationshipReqeustRequestDto,
  ) {
    await this.changeService.request({
      companyId: req.user.companyId,
      targetCompanyId: body.targetCompanyId,
      type: body.type,
    });
  }

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async search(
    @Request() req: AuthType,
    @Body() body: SearchPartnerRequestDto,
  ): Promise<SearchPartnerResponse> {
    const cp = await this.retriveService.searchPartner({
      companyId: req.user.companyId,
      companyRegistrationNumber: body.companyRegistrationNumber,
    });

    return cp;
  }

  @Post(':srcCompanyId/:dstCompanyId/deactive')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async deactive(
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

    await this.changeService.deactive({
      srcCompanyId,
      dstCompanyId,
    });
  }
}
