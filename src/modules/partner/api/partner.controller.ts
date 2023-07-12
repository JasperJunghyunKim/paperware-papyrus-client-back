import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { PartnerRetriveService } from '../service/partner-retrive.service';
import {
  PartnerResponseDto,
  PartnerTaxManagerCreateDto,
  PartnerTaxManagerListDto,
  PartnerTaxManagerUpdateDto,
} from './dto/partner.request';
import { PartnerChangeSerivce } from '../service/partner-change.service';
import { IdDto } from 'src/common/request';
import {
  PartnerTaxManagerItemResponse,
  PartnerTaxManagerListResponse,
} from 'src/@shared/api';

@Controller('/partner')
export class PartnerController {
  constructor(
    private readonly partnerRetriveService: PartnerRetriveService,
    private readonly partnerChangeService: PartnerChangeSerivce,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async getPartnerList(
    @Request() req: AuthType,
  ): Promise<PartnerResponseDto[]> {
    return await this.partnerRetriveService.getPartnerList(req.user.companyId);
  }

  @Get('/:companyRegistrationNumber/tax-manager')
  @UseGuards(AuthGuard)
  async getTaxManagerList(
    @Request() req: AuthType,
    @Param() param: PartnerTaxManagerListDto,
  ): Promise<PartnerTaxManagerListResponse> {
    return await this.partnerRetriveService.getTaxManagerList(
      req.user.companyId,
      param.companyRegistrationNumber,
    );
  }

  @Get('/tax-manager/:id')
  @UseGuards(AuthGuard)
  async getTaxManager(
    @Request() req: AuthType,
    @Param() idDto: IdDto,
  ): Promise<PartnerTaxManagerItemResponse> {
    return await this.partnerRetriveService.getTaxManager(
      idDto.id,
      req.user.companyId,
    );
  }

  @Post('/tax-manager')
  @UseGuards(AuthGuard)
  async createTaxManager(
    @Request() req: AuthType,
    @Body() dto: PartnerTaxManagerCreateDto,
  ) {
    return await this.partnerChangeService.createTaxManager({
      companyId: req.user.companyId,
      ...dto,
    });
  }

  @Put('/tax-manager/:id')
  @UseGuards(AuthGuard)
  async updateTaxManager(
    @Request() req: AuthType,
    @Param() idDto: IdDto,
    @Body() dto: PartnerTaxManagerUpdateDto,
  ) {
    return await this.partnerChangeService.updateTaxManger({
      companyId: req.user.companyId,
      taxManagerId: idDto.id,
      ...dto,
    });
  }

  @Delete('/tax-manager/:id')
  @UseGuards(AuthGuard)
  async deleteTaxManager(@Request() req: AuthType, @Param() idDto: IdDto) {
    return await this.partnerChangeService.deleteTaxManager({
      companyId: req.user.companyId,
      taxManagerId: idDto.id,
    });
  }
}
