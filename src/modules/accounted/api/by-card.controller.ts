import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { AccountedType } from '@prisma/client';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { ByCardChangeService } from '../service/by-card-change.service';
import { ByCardRetriveService } from '../service/by-card-retrive.service';
import { ByCardCreateRequestDto, ByCardUpdateRequestDto } from './dto/card.request';
import { ByCardResponseDto } from './dto/card.response';

@Controller('/accounted')
export class ByCardController {
  constructor(private readonly byCardRetriveService: ByCardRetriveService, private readonly byCardChangeService: ByCardChangeService) { }

  @Get('accountedType/:accountedType/accountedId/:accountedId/card')
  @UseGuards(AuthGuard)
  async getByCard(
    @Request() req: AuthType,
    @Param('accountedType') accountedType: AccountedType,
    @Param('accountedId') accountedId: number,
  ): Promise<ByCardResponseDto> {
    return await this.byCardRetriveService.getByCard(req.user.companyId, accountedType, accountedId);
  }

  @Post('accountedType/:accountedType/card')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async createByCard(@Param('accountedType') accountedType: AccountedType, @Body() byCardCreateRequest: ByCardCreateRequestDto): Promise<void> {
    await this.byCardChangeService.createCard(accountedType, byCardCreateRequest);
  }

  @Patch('accountedType/:accountedType/accountedId/:accountedId/card')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async updateByCard(
    @Param('accountedType') accountedType: AccountedType,
    @Param('accountedId') accountedId: number,
    @Body() byCardUpdateRequest: ByCardUpdateRequestDto,
  ): Promise<void> {
    await this.byCardChangeService.updateCard(accountedType, accountedId, byCardUpdateRequest);
  }

  @Delete('accountedType/:accountedType/accountedId/:accountedId/card')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async deleteByCard(@Param('accountedType') accountedType: AccountedType, @Param('accountedId') accountedId: number): Promise<void> {
    await this.byCardChangeService.deleteCard(accountedType, accountedId);
  }
}