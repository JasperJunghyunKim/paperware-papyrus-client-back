import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AccountedType } from '@prisma/client';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { ByCardChangeService } from '../service/by-card-change.service';
import { ByCardRetriveService } from '../service/by-card-retrive.service';
import {
  ByCardCreateRequestDto,
  ByCardUpdateRequestDto,
} from './dto/card.request';
import { ByCardResponseDto } from './dto/card.response';
import { AccountedTypeDto } from './dto/accounted.request';
import { IdDto } from 'src/modules/stock/api/dto/stock.request';

@Controller('/accounted')
export class ByCardController {
  constructor(
    private readonly byCardRetriveService: ByCardRetriveService,
    private readonly byCardChangeService: ByCardChangeService,
  ) {}

  @Get('accountedType/:accountedType/accountedId/:accountedId/card')
  @UseGuards(AuthGuard)
  async getByCard(
    @Request() req: AuthType,
    @Param('accountedType') accountedType: AccountedType,
    @Param('accountedId') accountedId: number,
  ): Promise<ByCardResponseDto> {
    return await this.byCardRetriveService.getByCard(
      req.user.companyId,
      accountedType,
      accountedId,
    );
  }

  @Post('accountedType/:accountedType/card')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async createByCard(
    @Request() req: AuthType,
    @Param() param: AccountedTypeDto,
    @Body() byCardCreateRequest: ByCardCreateRequestDto,
  ): Promise<void> {
    if (param.accountedType === 'PAID' && byCardCreateRequest.cardId === null)
      throw new BadRequestException(`카드를 선택해야 합니다.`);
    if (
      param.accountedType === 'COLLECTED' &&
      byCardCreateRequest.bankAccountId === null
    )
      throw new BadRequestException(`계좌를 선택해야 합니다.`);

    await this.byCardChangeService.createCard(
      req.user.companyId,
      param.accountedType,
      byCardCreateRequest,
    );
  }

  @Patch('accountedType/:accountedType/accountedId/:id/card')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async updateByCard(
    @Param() param: IdDto & AccountedTypeDto,
    @Body() byCardUpdateRequest: ByCardUpdateRequestDto,
  ): Promise<void> {
    await this.byCardChangeService.updateCard(
      param.accountedType,
      param.id,
      byCardUpdateRequest,
    );
  }

  @Delete('accountedType/:accountedType/accountedId/:accountedId/card')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async deleteByCard(
    @Param('accountedType') accountedType: AccountedType,
    @Param('accountedId') accountedId: number,
  ): Promise<void> {
    await this.byCardChangeService.deleteCard(accountedType, accountedId);
  }
}
