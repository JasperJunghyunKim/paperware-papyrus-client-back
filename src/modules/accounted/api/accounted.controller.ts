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
import { AccountedType } from '@prisma/client';
import { AccountedListResponse } from 'src/@shared/api';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { AccountedChangeService } from '../service/accounted-change.service';
import { AccountedRetriveService } from '../service/accounted-retrive.service';
import { AccountedRequest } from './dto/accounted.request';
import { CashRequest } from './dto/cash.request';
import { CashResponse } from './dto/cash.response';
import { EtcRequest } from './dto/etc.request';
import { EtcResponse } from './dto/etc.response';

@Controller('/accounted')
export class AccountedController {
  constructor(
    private readonly accountedRetriveService: AccountedRetriveService,
    private readonly accountedChangeService: AccountedChangeService,
  ) { }

  @Get('accountedType/:accountedType')
  @UseGuards(AuthGuard)
  async getcAccountedList(
    @Request() req: AuthType,
    @Param('accountedType') accountedType: AccountedType,
    @Query() accountedRequest: AccountedRequest
  ): Promise<AccountedListResponse> {
    return await this.accountedRetriveService.getAccountedList(req.user.companyId, accountedType, accountedRequest);
  }

  @Get('accountedType/:accountedType/accountedId/:accountedId/cash')
  @UseGuards(AuthGuard)
  async getByCash(
    @Request() req: AuthType,
    @Param('accountedType') accountedType: AccountedType,
    @Param('accountedId') accountedId: number,
  ): Promise<CashResponse> {
    return await this.accountedRetriveService.getAccountedByCash(req.user.companyId, accountedType, accountedId);
  }

  @Post('accountedType/:accountedType/cash')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async createCash(
    @Param('accountedType') accountedType: AccountedType,
    @Body() collectedCashRequest: CashRequest,
  ): Promise<void> {
    await this.accountedChangeService.createCash(accountedType, collectedCashRequest);
  }

  @Patch('accountedType/:accountedType/accountedId/:accountedId/cash')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async updateCash(
    @Param('accountedType') accountedType: AccountedType,
    @Param('accountedId') accountedId: number,
    @Body() collectedCashRequest: CashRequest,
  ): Promise<void> {
    await this.accountedChangeService.updateCash(accountedType, accountedId, collectedCashRequest);
  }

  @Delete('accountedType/:accountedType/accountedId/:accountedId/cash')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async deleteCash(
    @Param('accountedType') accountedType: AccountedType,
    @Param('accountedId') accountedId: number,
  ): Promise<void> {
    await this.accountedChangeService.deleteCash(accountedType, accountedId);
  }

  ///////////////////////////////////////////////////////////////

  @Get('accountedType/:accountedType/accountedId/:accountedId/etc')
  @UseGuards(AuthGuard)
  async getcollectedByEtc(
    @Request() req: AuthType,
    @Param('accountedType') accountedType: AccountedType,
    @Param('accountedId') accountedId: number,
  ): Promise<EtcResponse> {
    return await this.accountedRetriveService.getAccountedByEtc(req.user.companyId, accountedType, accountedId);
  }

  @Post('accountedType/:accountedType/etc')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async createEtc(
    @Param('accountedType') accountedType: AccountedType,
    @Body() etcRequest: EtcRequest,
  ): Promise<void> {
    await this.accountedChangeService.createEtc(accountedType, etcRequest);
  }

  @Patch('accountedType/:accountedType/accountedId/:accountedId/etc')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async updateEtc(
    @Param('accountedType') accountedType: AccountedType,
    @Param('accountedId') accountedId: number,
    @Body() etcRequest: EtcRequest,
  ): Promise<void> {
    await this.accountedChangeService.updateEtc(accountedType, accountedId, etcRequest);
  }

  @Delete('accountedType/:accountedType/accountedId/:accountedId/etc')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async deleteEtc(
    @Param('accountedType') accountedType: AccountedType,
    @Param('accountedId') accountedId: number,
  ): Promise<void> {
    await this.accountedChangeService.deleteEtc(accountedType, accountedId);
  }
}
