import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { AccountedType } from '@prisma/client';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { ByCashChangeService } from '../service/by-cash-change.service';
import { ByCashRetriveService } from '../service/by-cash-retrive.service';
import { CashResponse } from './dto/cash.response';
import { ByCashCreateRequestDto, ByCashUpdateRequestDto } from './dto/cash.request';

@Controller('/accounted')
export class ByCashController {
  constructor(private readonly byCashRetriveService: ByCashRetriveService, private readonly byCashChangeService: ByCashChangeService) { }

  @Get('accountedType/:accountedType/accountedId/:accountedId/cash')
  @UseGuards(AuthGuard)
  async getByCash(
    @Request() req: AuthType,
    @Param('accountedType') accountedType: AccountedType,
    @Param('accountedId') accountedId: number,
  ): Promise<CashResponse> {
    return await this.byCashRetriveService.getByCash(req.user.companyId, accountedType, accountedId);
  }

  @Post('accountedType/:accountedType/cash')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async createCash(@Param('accountedType') accountedType: AccountedType, @Body() byCashCreateRequest: ByCashCreateRequestDto): Promise<void> {
    await this.byCashChangeService.createCash(accountedType, byCashCreateRequest);
  }

  @Patch('accountedType/:accountedType/accountedId/:accountedId/cash')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async updateCash(
    @Param('accountedType') accountedType: AccountedType,
    @Param('accountedId') accountedId: number,
    @Body() byCashUpdateRequest: ByCashUpdateRequestDto,
  ): Promise<void> {
    await this.byCashChangeService.updateCash(accountedType, accountedId, byCashUpdateRequest);
  }

  @Delete('accountedType/:accountedType/accountedId/:accountedId/cash')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async deleteCash(@Param('accountedType') accountedType: AccountedType, @Param('accountedId') accountedId: number): Promise<void> {
    await this.byCashChangeService.deleteCash(accountedType, accountedId);
  }
}
