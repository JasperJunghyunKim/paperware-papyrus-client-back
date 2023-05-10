import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards
} from '@nestjs/common';
import { PaidListResponse } from 'src/@shared/api';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { AccountedChangeService } from '../service/accounted-change.service';
import { AccountedRetriveService } from '../service/accounted-retrive.service';
import { PaidCashRequest } from './dto/cash.request';
import { PaidEtcRequest } from './dto/etc.request';
import { PaidEtcResponse } from './dto/etc.response';
import { PaidRequest } from './dto/paid.request';

@Controller('/paid')
export class PaidController {
  constructor(
    private readonly accountedRetriveService: AccountedRetriveService,
    private readonly accountedChangeService: AccountedChangeService,
  ) { }

  @Get()
  @UseGuards(AuthGuard)
  async getPaidList(
    @Request() req: AuthType,
    @Query() paidRequest: PaidRequest
  ): Promise<PaidListResponse> {
    return await this.accountedRetriveService.getPaidList(req.user.companyId, paidRequest);
  }

  @Get(':accountedId/cash')
  @UseGuards(AuthGuard)
  async getPaidByCash(
    @Request() req: AuthType,
    @Param('accountedId') accountedId: number,
  ): Promise<PaidEtcResponse> {
    return await this.accountedRetriveService.getPaidByCash(req.user.companyId, accountedId);
  }

  @Post('/cash')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async createCash(
    @Body() paidCashRequest: PaidCashRequest,
  ): Promise<void> {
    await this.accountedChangeService.createCash(paidCashRequest);
  }

  @Patch(':accountedId/cash')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async updateCash(
    @Param('accountedId') accountedId: number,
    @Body() paidCashRequest: PaidCashRequest,
  ): Promise<void> {
    await this.accountedChangeService.updateCash(accountedId, paidCashRequest);
  }

  @Delete(':accountedId/cash')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async deleteCash(
    @Param('accountedId') accountedId: number,
  ): Promise<void> {
    await this.accountedChangeService.deleteCash(accountedId);
  }

  @Get(':accountedId/etc')
  @UseGuards(AuthGuard)
  async getPaidByEtc(
    @Request() req: AuthType,
    @Param('accountedId') accountedId: number,
  ): Promise<PaidEtcResponse> {
    return await this.accountedRetriveService.getPaidByEtc(req.user.companyId, accountedId);
  }

  @Post('/etc')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async createEtc(
    @Body() paidEtcRequest: PaidEtcRequest,
  ): Promise<void> {
    await this.accountedChangeService.createEtc(paidEtcRequest);
  }

  @Patch(':accountedId/etc')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async updateEtc(
    @Param('accountedId') accountedId: number,
    @Body() paidEtcRequest: PaidEtcRequest,
  ): Promise<void> {
    await this.accountedChangeService.updateEtc(accountedId, paidEtcRequest);
  }

  @Delete(':accountedId/etc')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async deleteEtc(
    @Param('accountedId') accountedId: number,
  ): Promise<void> {
    await this.accountedChangeService.deleteEtc(accountedId);
  }
}
