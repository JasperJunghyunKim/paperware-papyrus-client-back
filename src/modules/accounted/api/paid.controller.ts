import {
  Controller,
  Get,
  Param,
  Query,
  Request,
  UseGuards
} from '@nestjs/common';
import { PaidByCashItemResponse, PaidByEtcItemResponse, PaidListResponse } from 'src/@shared/api';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { AccountedRetriveService } from '../service/accounted-retrive.service';
import { PaidRequest } from './dto/paid.request';

@Controller('/paid')
export class PaidController {
  constructor(
    private readonly accountedRetriveService: AccountedRetriveService,
  ) { }

  @Get()
  @UseGuards(AuthGuard)
  async getPaidList(
    @Request() req: AuthType,
    @Query() paidRequest: PaidRequest
  ): Promise<PaidListResponse> {
    return await this.accountedRetriveService.getPaidList(req.user.companyId, paidRequest);
  }

  @Get(':paidId/cash')
  @UseGuards(AuthGuard)
  async getPaidByCash(
    @Request() req: AuthType,
    @Param('paidId') paidId: number,
  ): Promise<PaidByCashItemResponse> {
    return await this.accountedRetriveService.getPaidByCash(req.user.companyId, paidId);
  }

  @Get()
  @UseGuards(AuthGuard)
  async getPaidByEtc(
    @Request() req: AuthType,
    @Param('paidId') paidId: number,
  ): Promise<PaidByEtcItemResponse> {
    return await this.accountedRetriveService.getPaidByEtc(req.user.companyId, paidId);
  }
}
