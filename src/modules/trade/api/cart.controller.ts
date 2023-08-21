import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CartRetriveService } from '../service/cart.retrive.service';
import { CartChangeService } from '../service/cart.change.service';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { CartCreateDto, CartListDto } from './dto/cart.request';
import { CartListResponse } from 'src/@shared/api/trade/cart.response';
import { IdDto } from 'src/common/request';

@Controller('/cart')
export class CartController {
  constructor(
    private readonly retrive: CartRetriveService,
    private readonly change: CartChangeService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async getList(
    @Request() req: AuthType,
    @Query() dto: CartListDto,
  ): Promise<CartListResponse> {
    return await this.retrive.getList(req.user.id, dto.type);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async create(@Request() req: AuthType, @Body() dto: CartCreateDto) {
    return await this.change.create({
      userId: req.user.id,
      userCompanyId: req.user.companyId,
      ...dto,
      sizeY: dto.sizeY || 0,
    });
  }

  @Delete('/:id')
  @UseGuards(AuthGuard)
  async delete(@Request() req: AuthType, @Param() param: IdDto) {
    return await this.change.delete(req.user.id, param.id);
  }
}
