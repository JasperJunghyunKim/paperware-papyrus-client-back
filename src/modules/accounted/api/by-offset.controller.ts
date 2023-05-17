import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { AccountedType } from '@prisma/client';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { ByBankAccountChangeService } from '../service/by-bank-account-change.service';
import { ByBankAccountRetriveService } from '../service/by-bank-account-retrive.service';
import { ByBankAccountCreateRequestDto, ByBankAccountUpdateRequestDto } from './dto/bank-account.request';
import { ByEtcResponse } from './dto/etc.response';

@Controller('/accounted')
export class ByOffsetController {
  constructor(private readonly byBankAccountRetriveService: ByBankAccountRetriveService, private readonly byBankAccountChangeService: ByBankAccountChangeService) { }

  @Get('accountedType/:accountedType/accountedId/:accountedId/offset')
  @UseGuards(AuthGuard)
  async getcollectedByEtc(
    @Request() req: AuthType,
    @Param('accountedType') accountedType: AccountedType,
    @Param('accountedId') accountedId: number,
  ): Promise<ByEtcResponse> {
    return await this.byBankAccountRetriveService.getAccountedByBankAccount(req.user.companyId, accountedType, accountedId);
  }

  @Post('accountedType/:accountedType/offset')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async createEtc(@Param('accountedType') accountedType: AccountedType, @Body() byBankAccountCreateRequest: ByBankAccountCreateRequestDto): Promise<void> {
    await this.byBankAccountChangeService.createBankAccount(accountedType, byBankAccountCreateRequest);
  }

  @Patch('accountedType/:accountedType/accountedId/:accountedId/offset')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async updateEtc(
    @Param('accountedType') accountedType: AccountedType,
    @Param('accountedId') accountedId: number,
    @Body() byBankAccountUpdateRequest: ByBankAccountUpdateRequestDto,
  ): Promise<void> {
    await this.byBankAccountChangeService.updateBankAccount(accountedType, accountedId, byBankAccountUpdateRequest);
  }

  @Delete('accountedType/:accountedType/accountedId/:accountedId/offset')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async deleteEtc(@Param('accountedType') accountedType: AccountedType, @Param('accountedId') accountedId: number): Promise<void> {
    await this.byBankAccountChangeService.deleteBankAccount(accountedType, accountedId);
  }
}
