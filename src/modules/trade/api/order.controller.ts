import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Request,
  Body,
  ForbiddenException,
} from '@nestjs/common';
import { OrderChangeService } from '../service/order-change.service';
import { OrderRetriveService } from '../service/order-retrive.service';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { OrderStockCreateRequestDto } from './dto/order.request';

@Controller('/order')
export class OrderController {
  constructor(
    private readonly change: OrderChangeService,
    private readonly retrive: OrderRetriveService,
  ) {}

  @Post('stock')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createStockOrder(
    @Request() req: AuthType,
    @Body() body: OrderStockCreateRequestDto,
  ) {
    if (
      body.srcCompanyId !== req.user.companyId &&
      body.dstCompanyId !== req.user.companyId
    ) {
      throw new ForbiddenException(
        '매입처와 매출처 중 하나는 귀사로 지정되어야합니다.',
      );
    }

    // TODO: 등록된 거래 관계인지 확인

    const isOffer = body.dstCompanyId === req.user.companyId;

    return this.change.createStockOrder({
      srcCompanyId: body.srcCompanyId,
      dstCompanyId: body.dstCompanyId,
      locationId: body.locationId,
      stockGroupId: body.stockGroupId,
      quantity: body.quantity,
      memo: body.memo,
      wantedDate: body.wantedDate,
      isOffer,
    });
  }
}
