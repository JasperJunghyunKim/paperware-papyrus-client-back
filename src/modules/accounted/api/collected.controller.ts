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
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { AccountedChangeService } from '../service/accounted-change.service';
import { AccountedRetriveService } from '../service/accounted-retrive.service';
import { AccountedRequest } from './dto/accounted.request';
import { CashRequest } from './dto/cash.request';
import { EtcResponse } from './dto/etc.response';
import { EtcRequest } from './dto/etc.request';
import { AccountedListResponse } from 'src/@shared/api';
import { CashResponse } from './dto/cash.response';
import { AccountedType } from '@prisma/client';

@Controller('/collected')
export class CollectedController {
  constructor(
    private readonly accountedRetriveService: AccountedRetriveService,
    private readonly accountedChangeService: AccountedChangeService,
  ) { }

  @Get()
  @UseGuards(AuthGuard)
  async getcollectedList(
    @Request() req: AuthType,
    @Query() collectedRequest: AccountedRequest
  ): Promise<AccountedListResponse> {
    return await this.accountedRetriveService.getAccountedList(req.user.companyId, collectedRequest);
  }

  @Get(':accountedId/cash/:accountedType')
  @UseGuards(AuthGuard)
  async getcollectedByCash(
    @Request() req: AuthType,
    @Param('accountedId') accountedId: number,
    @Param('accountedType') accountedType: AccountedType,
  ): Promise<CashResponse> {
    return await this.accountedRetriveService.getAccountedByCash(req.user.companyId, accountedId, accountedType);
  }

  @Post('/cash')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async createCash(
    @Body() collectedCashRequest: CashRequest,
  ): Promise<void> {
    await this.accountedChangeService.createCash(collectedCashRequest);
  }

  @Patch(':accountedId/cash')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async updateCash(
    @Param('accountedId') accountedId: number,
    @Body() collectedCashRequest: CashRequest,
  ): Promise<void> {
    await this.accountedChangeService.updateCash(accountedId, collectedCashRequest);
  }

  @Delete(':accountedId/cash')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async deleteCash(
    @Param('accountedId') accountedId: number,
  ): Promise<void> {
    await this.accountedChangeService.deleteCash(accountedId);
  }

  @Get(':accountedId/etc/:accountedType')
  @UseGuards(AuthGuard)
  async getcollectedByEtc(
    @Request() req: AuthType,
    @Param('accountedId') accountedId: number,
    @Param('accountedType') accountedType: AccountedType,
  ): Promise<EtcResponse> {
    return await this.accountedRetriveService.getAccountedByEtc(req.user.companyId, accountedId, accountedType);
  }

  @Post('/etc')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async createEtc(
    @Body() collectedEtcRequest: EtcRequest,
  ): Promise<void> {
    await this.accountedChangeService.createEtc(collectedEtcRequest);
  }

  @Patch(':accountedId/etc')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async updateEtc(
    @Param('accountedId') accountedId: number,
    @Body() collectedEtcRequest: EtcRequest,
  ): Promise<void> {
    await this.accountedChangeService.updateEtc(accountedId, collectedEtcRequest);
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
