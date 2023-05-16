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
  Request,
  UseGuards
} from '@nestjs/common';
import { CardCreateRequest, CardUpdateRequest } from 'src/@shared/api/card/card.request';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { CardChangeService } from '../service/card-change.service';
import { CardRetriveService } from '../service/card-retrive.service';
import { CardItemResponseDto, CardListResponseDto } from './dto/card.response';

@Controller('/card')
export class CardController {
  constructor(
    private readonly cardRetriveService: CardRetriveService,
    private readonly cardCahngeService: CardChangeService,
  ) { }

  @Get()
  @UseGuards(AuthGuard)
  async getCardList(
    @Request() req: AuthType,
  ): Promise<CardListResponseDto> {
    return await this.cardRetriveService.getCardList(req.user.companyId);
  }

  @Get(':cardId')
  @UseGuards(AuthGuard)
  async getCardItem(
    @Param('cardId') cardId: number,
  ): Promise<CardItemResponseDto> {
    return await this.cardRetriveService.getCardItem(cardId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async createCard(@Request() req: AuthType, @Body() cardCreateRequest: CardCreateRequest): Promise<void> {
    await this.cardCahngeService.createCard(req.user.companyId, cardCreateRequest);
  }

  @Patch(':cardId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async updateCard(
    @Param('cardId') cardId: number,
    @Body() cardUpdateRequest: CardUpdateRequest,
  ): Promise<void> {
    await this.cardCahngeService.updateCard(cardId, cardUpdateRequest);
  }

  @Delete(':cardId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async deleteCard(@Param('cardId') cardId: number): Promise<void> {
    await this.cardCahngeService.deleteCard(cardId);
  }
}
