import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { AccountedType } from '@prisma/client';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { ByCardCreateRequestDto, ByCardUpdateRequestDto } from './dto/card.request';
import { ByEtcResponse } from './dto/etc.response';
import { ByCardRetriveService } from '../service/by-card-retrive.service';
import { ByCardChangeService } from '../service/by-card-change.service';

@Controller('/accounted')
export class ByCardController {
  constructor(private readonly byCardRetriveService: ByCardRetriveService, private readonly byCardChangeService: ByCardChangeService) { }

  @Get('accountedType/:accountedType/accountedId/:accountedId/card')
  @UseGuards(AuthGuard)
  async getcollectedByEtc(
    @Request() req: AuthType,
    @Param('accountedType') accountedType: AccountedType,
    @Param('accountedId') accountedId: number,
  ): Promise<ByEtcResponse> {
    return await this.byCardRetriveService.getAccountedByCard(req.user.companyId, accountedType, accountedId);
  }

  @Post('accountedType/:accountedType/card')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async createEtc(@Param('accountedType') accountedType: AccountedType, @Body() byCardCreateRequest: ByCardCreateRequestDto): Promise<void> {
    await this.byCardChangeService.createCard(accountedType, byCardCreateRequest);
  }

  @Patch('accountedType/:accountedType/accountedId/:accountedId/card')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async updateEtc(
    @Param('accountedType') accountedType: AccountedType,
    @Param('accountedId') accountedId: number,
    @Body() byCardUpdateRequest: ByCardUpdateRequestDto,
  ): Promise<void> {
    await this.byCardChangeService.updateCard(accountedType, accountedId, byCardUpdateRequest);
  }

  @Delete('accountedType/:accountedType/accountedId/:accountedId/card')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async deleteEtc(@Param('accountedType') accountedType: AccountedType, @Param('accountedId') accountedId: number): Promise<void> {
    await this.byCardChangeService.deleteCard(accountedType, accountedId);
  }
}
