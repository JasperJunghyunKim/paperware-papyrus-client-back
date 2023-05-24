import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { OrderChangeService } from '../service/order-change.service';
import { OrderRetriveService } from '../service/order-retrive.service';
import OrderStockCreateRequestDto, {
  OrderIdDto,
  OrderListQueryDto,
  OrderStockArrivalCreateRequestDto,
  OrderStockArrivalListQueryDto,
  OrderStockUpdateRequestDto,
  UpdateTradePriceDto,
} from './dto/order.request';
import { OrderStockArrivalListResponse, TradePriceResponse } from 'src/@shared/api';
import { Api } from 'src/@shared';

@Controller('/order')
export class OrderController {
  constructor(
    private readonly change: OrderChangeService,
    private readonly retrive: OrderRetriveService,
  ) { }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getList(@Request() req: AuthType, @Query() query: OrderListQueryDto) {
    if (
      query.srcCompanyId !== req.user.companyId &&
      query.dstCompanyId !== req.user.companyId
    ) {
      throw new ForbiddenException(
        '매입처와 매출처 중 하나는 귀사로 지정되어야합니다.',
      );
    }

    // isSales == true: 매출 목록 조회
    const isSales = query.dstCompanyId === req.user.companyId;

    const status: OrderStatus[] = isSales
      ? [
        'OFFER_PREPARING',
        'OFFER_REQUESTED',
        'OFFER_REJECTED',
        'ACCEPTED',
        'ORDER_REQUESTED',
        'ORDER_REJECTED',
      ]
      : [
        'ORDER_PREPARING',
        'ORDER_REQUESTED',
        'ORDER_REJECTED',
        'ACCEPTED',
        'OFFER_REQUESTED',
        'OFFER_REJECTED',
      ];

    const items = await this.retrive.getList({
      skip: query.skip,
      take: query.take,
      dstCompanyId: query.dstCompanyId,
      srcCompanyId: query.srcCompanyId,
      status,
    });

    const total = await this.retrive.getCount({
      dstCompanyId: query.dstCompanyId,
      srcCompanyId: query.srcCompanyId,
    });

    return {
      items,
      total,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getItem(@Request() req: AuthType, @Param('id') id: number) {
    const item = await this.retrive.getItem({ orderId: id });

    if (
      item.srcCompany.id !== req.user.companyId &&
      item.dstCompany.id !== req.user.companyId
    ) {
      throw new ForbiddenException(
        '매입처와 매출처 중 하나는 귀사로 지정되어야합니다.',
      );
    }

    return item;
  }

  @Post('stock')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createStockOrder(
    @Request() req: AuthType,
    @Body() body: OrderStockCreateRequestDto,
  ): Promise<Api.OrderCreateResponse> {
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
      warehouseId: body.warehouseId,
      orderStockId: body.orderStockId,
      productId: body.productId,
      packagingId: body.packagingId,
      grammage: body.grammage,
      sizeX: body.sizeX,
      sizeY: body.sizeY,
      paperColorGroupId: body.paperColorGroupId,
      paperColorId: body.paperColorId,
      paperPatternId: body.paperPatternId,
      paperCertId: body.paperCertId,
      quantity: body.quantity,
      memo: body.memo,
      wantedDate: body.wantedDate,
      isOffer,
    });
  }

  @Put('stock/:id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateStockOrder(
    @Request() req: AuthType,
    @Param('id') id: string,
    @Body() body: OrderStockUpdateRequestDto,
  ) {
    const order = await this.retrive.getItem({ orderId: Number(id) });

    if (!order) {
      throw new ForbiddenException('존재하지 않는 주문입니다.');
    }

    // TODO: 상태별 수정 가능 여부 확인
    if (
      order.srcCompany.id !== req.user.companyId &&
      order.dstCompany.id !== req.user.companyId
    ) {
      throw new ForbiddenException('수정 권한이 없습니다.');
    }

    this.change.updateStockOrder({
      orderId: Number(id),
      locationId: body.locationId,
      warehouseId: body.warehouseId,
      productId: body.productId,
      packagingId: body.packagingId,
      grammage: body.grammage,
      sizeX: body.sizeX,
      sizeY: body.sizeY,
      paperColorGroupId: body.paperColorGroupId,
      paperColorId: body.paperColorId,
      paperPatternId: body.paperPatternId,
      paperCertId: body.paperCertId,
      quantity: body.quantity,
      memo: body.memo,
      wantedDate: body.wantedDate,
    });
  }

  @Get('stock/:id/arrival')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async getArrival(
    @Request() req: AuthType,
    @Param('id') id: string,
    @Query() query: OrderStockArrivalListQueryDto,
  ): Promise<OrderStockArrivalListResponse> {
    const order = await this.retrive.getItem({ orderId: Number(id) });

    if (!order) {
      throw new ForbiddenException('존재하지 않는 주문입니다.');
    }

    if (order.srcCompany.id !== req.user.companyId) {
      throw new ForbiddenException('조회 권한이 없습니다.');
    }

    const items = await this.retrive.getOrderStockArrivalList({
      companyId: req.user.companyId,
      skip: query.skip,
      take: query.take,
      orderId: Number(id),
    });

    const total = await this.retrive.getOrderStockArrivalCount({
      orderId: Number(id),
    });

    return {
      items,
      total,
    };
  }

  @Post(':id/request')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async requestOrder(@Request() req: AuthType, @Param('id') id: string) {
    const order = await this.retrive.getItem({ orderId: Number(id) });

    if (!order) {
      throw new ForbiddenException('존재하지 않는 주문입니다.');
    }

    // TODO: 조건 확인 필요함

    await this.change.request({ orderId: Number(id) });
  }

  @Post(':id/accept')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async acceptOrder(@Request() req: AuthType, @Param('id') id: string) {
    const order = await this.retrive.getItem({ orderId: Number(id) });

    if (!order) {
      throw new ForbiddenException('존재하지 않는 주문입니다.');
    }

    await this.change.accept({ orderId: Number(id) });
  }

  @Post(':id/reject')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async rejectOrder(@Request() req: AuthType, @Param('id') id: string) {
    const order = await this.retrive.getItem({ orderId: Number(id) });

    if (!order) {
      throw new ForbiddenException('존재하지 않는 주문입니다.');
    }

    await this.change.reject({ orderId: Number(id) });
  }

  @Post(':id/cancel')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async cancelOrder(@Request() req: AuthType, @Param('id') id: string) {
    const order = await this.retrive.getItem({ orderId: Number(id) });

    if (!order) {
      throw new ForbiddenException('존재하지 않는 주문입니다.');
    }

    await this.change.cancel({ orderId: Number(id) });
  }

  @Post(':id/reset')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async resetOrder(@Request() req: AuthType, @Param('id') id: string) {
    const order = await this.retrive.getItem({ orderId: Number(id) });

    if (!order) {
      throw new ForbiddenException('존재하지 않는 주문입니다.');
    }

    await this.change.reset({ orderId: Number(id) });
  }

  @Post(':id/arrival')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async createArrival(
    @Request() req: AuthType,
    @Param('id') id: string,
    @Body() body: OrderStockArrivalCreateRequestDto,
  ) {
    body.validate();
    const order = await this.retrive.getItem({ orderId: Number(id) });

    if (!order) {
      throw new ForbiddenException('존재하지 않는 주문입니다.');
    }

    if (order.srcCompany.id !== req.user.companyId) {
      throw new ForbiddenException('등록 권한이 없습니다.');
    }

    await this.change.createArrival({
      orderId: Number(id),
      productId: body.productId,
      packagingId: body.packagingId,
      grammage: body.grammage,
      sizeX: body.sizeX,
      sizeY: body.sizeY || 0,
      paperColorGroupId: body.paperColorGroupId,
      paperColorId: body.paperColorId,
      paperPatternId: body.paperPatternId,
      paperCertId: body.paperCertId,
      quantity: body.quantity,
      isSyncPrice: body.isSyncPrice,
      stockPrice: body.stockPrice,
    });
  }

  @Get('/:orderId/price')
  @UseGuards(AuthGuard)
  async getTradePrice(
    @Request() req: AuthType,
    @Param() dto: OrderIdDto,
  ): Promise<TradePriceResponse> {
    return await this.retrive.getTradePrice(req.user.companyId, dto.orderId);
  }

  @Put('/:orderId/price')
  @UseGuards(AuthGuard)
  async updateTradePrice(
    @Request() req: AuthType,
    @Param() parmDto: OrderIdDto,
    @Body() dto: UpdateTradePriceDto,
  ) {
    await this.change.updateTradePrice(
      req.user.companyId,
      parmDto.orderId,
      dto,
    )
  }
}
