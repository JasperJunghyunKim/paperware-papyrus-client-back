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
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  CardCreateRequest,
  CardUpdateRequest,
} from 'src/@shared/api/inhouse/card.request';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { CardChangeService } from '../service/card-change.service';
import { CardRetriveService } from '../service/card-retrive.service';
import { CardListDto } from './dto/card.request';
import { CardListResponse } from 'src/@shared/api';
import { IdDto } from 'src/common/request';

@Controller('/card')
export class CardController {
  constructor(
    private readonly cardRetriveService: CardRetriveService,
    private readonly cardCahngeService: CardChangeService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async getCardList(
    @Request() req: AuthType,
    @Query() dto: CardListDto,
  ): Promise<CardListResponse> {
    return await this.cardRetriveService.getCardList(
      req.user.companyId,
      dto.skip,
      dto.take,
    );
  }

  @Get('/:id')
  @UseGuards(AuthGuard)
  async getCardItem(
    @Request() req: AuthType,
    @Param() param: IdDto,
  ): Promise<any> {
    return await this.cardRetriveService.getCardItem(
      req.user.companyId,
      param.id,
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async createCard(
    @Request() req: AuthType,
    @Body() cardCreateRequest: CardCreateRequest,
  ): Promise<void> {
    await this.cardCahngeService.createCard(
      req.user.companyId,
      cardCreateRequest,
    );
  }

  @Put('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async updateCard(
    @Request() req: AuthType,
    @Param() param: IdDto,
    @Body() dto: CardUpdateRequest,
  ): Promise<void> {
    await this.cardCahngeService.updateCard({
      companyId: req.user.companyId,
      cardId: param.id,
      ...dto,
    });
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async deleteCard(
    @Request() req: AuthType,
    @Param() param: IdDto,
  ): Promise<void> {
    await this.cardCahngeService.deleteCard(req.user.companyId, param.id);
  }
}
