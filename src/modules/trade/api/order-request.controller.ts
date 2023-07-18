import {
  Body,
  Controller,
  NotImplementedException,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { OrderRequestChangeService } from '../service/order-rerquest.change.service';
import { OrderRequestRetriveService } from '../service/order-rerquest.retrive.service';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { OrderRequestCreateDto } from './dto/order-request.request';

@Controller('/order-request')
export class OrderRequestController {
  constructor(
    private readonly change: OrderRequestChangeService,
    private readonly retrive: OrderRequestRetriveService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(@Request() req: AuthType, @Body() dto: OrderRequestCreateDto) {
    throw new NotImplementedException();
    return await this.change.create({
      userId: req.user.id,
      companyId: req.user.companyId,
      ...dto,
    });
  }
}
