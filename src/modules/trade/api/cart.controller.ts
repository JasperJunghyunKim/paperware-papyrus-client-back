import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CartRetriveService } from '../service/cart.retrive.service';
import { CartChangeService } from '../service/cart.change.service';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { CartCreateDto } from './dto/cart.request';

@Controller('/cart')
export class CartController {
  constructor(
    private readonly retrive: CartRetriveService,
    private readonly change: CartChangeService,
  ) {}

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
}
