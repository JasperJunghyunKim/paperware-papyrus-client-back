import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { AccountedType } from '@prisma/client';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { ByEtcChangeService } from '../service/by-etc-change.service';
import { ByEtcRetriveService } from '../service/by-etc-retrive.service';
import { EtcRequest } from './dto/etc.request';
import { EtcResponse } from './dto/etc.response';

@Controller('/accounted')
export class ByEtcController {
  constructor(private readonly byEtcRetriveService: ByEtcRetriveService, private readonly byEtcChangeService: ByEtcChangeService) { }

  @Get('accountedType/:accountedType/accountedId/:accountedId/etc')
  @UseGuards(AuthGuard)
  async getcollectedByEtc(
    @Request() req: AuthType,
    @Param('accountedType') accountedType: AccountedType,
    @Param('accountedId') accountedId: number,
  ): Promise<EtcResponse> {
    return await this.byEtcRetriveService.getAccountedByEtc(req.user.companyId, accountedType, accountedId);
  }

  @Post('accountedType/:accountedType/etc')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async createEtc(@Param('accountedType') accountedType: AccountedType, @Body() etcRequest: EtcRequest): Promise<void> {
    await this.byEtcChangeService.createEtc(accountedType, etcRequest);
  }

  @Patch('accountedType/:accountedType/accountedId/:accountedId/etc')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async updateEtc(
    @Param('accountedType') accountedType: AccountedType,
    @Param('accountedId') accountedId: number,
    @Body() etcRequest: EtcRequest,
  ): Promise<void> {
    await this.byEtcChangeService.updateEtc(accountedType, accountedId, etcRequest);
  }

  @Delete('accountedType/:accountedType/accountedId/:accountedId/etc')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async deleteEtc(@Param('accountedType') accountedType: AccountedType, @Param('accountedId') accountedId: number): Promise<void> {
    await this.byEtcChangeService.deleteEtc(accountedType, accountedId);
  }
}
