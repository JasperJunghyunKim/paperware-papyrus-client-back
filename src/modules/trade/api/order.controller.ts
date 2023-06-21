import {
  Body,
  Controller,
  Delete,
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
  IdDto,
  OrderDepositAssignDepositCreateDto,
  OrderDepositAssignDepositUpdateDto,
  OrderDepositCreateDto,
  OrderEtcCreateDto,
  OrderEtcUpdateDto,
  OrderIdDto,
  OrderListQueryDto,
  OrderProcessCreateDto,
  OrderProcessInfoUpdateDto,
  OrderProcessStockUpdateDto,
  OrderStockArrivalCreateRequestDto,
  OrderStockArrivalListQueryDto,
  OrderStockAssignStockUpdateRequestDto,
  OrderStockUpdateRequestDto,
  UpdateTradePriceDto,
} from './dto/order.request';
import {
  OrderCreateResponse,
  OrderDepositResponse,
  OrderEtcResponse,
  OrderProcessResponse,
  OrderStockArrivalListResponse,
  TradePriceResponse,
} from 'src/@shared/api';
import { Util } from 'src/common';

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
  ): Promise<OrderCreateResponse> {
    if (
      body.srcCompanyId !== req.user.companyId &&
      body.dstCompanyId !== req.user.companyId
    ) {
      throw new ForbiddenException(
        '매입처와 매출처 중 하나는 귀사로 지정되어야합니다.',
      );
    }

    // TODO: 등록된 거래 관계인지 확인
    // TODO: 재고 가용수량 확인

    const isOffer = body.dstCompanyId === req.user.companyId;

    return await this.change.insertOrder({
      srcCompanyId: body.srcCompanyId,
      dstCompanyId: body.dstCompanyId,
      locationId: body.locationId,
      warehouseId: body.warehouseId,
      planId: body.planId,
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

    await this.change.updateOrder({
      orderId: Number(id),
      locationId: body.locationId,
      memo: body.memo,
      wantedDate: body.wantedDate,
    });
  }

  @Put('stock/:id/assign')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateStockOrderAssign(
    @Request() req: AuthType,
    @Param('id') id: string,
    @Body() body: OrderStockAssignStockUpdateRequestDto,
  ) {
    const order = await this.retrive.getItem({ orderId: Number(id) });

    if (!order) {
      throw new ForbiddenException('존재하지 않는 주문입니다.');
    }

    if (
      order.srcCompany.id !== req.user.companyId &&
      order.dstCompany.id !== req.user.companyId
    ) {
      throw new ForbiddenException('수정 권한이 없습니다.');
    }

    await this.change.updateOrderAssignStock({
      orderId: Number(id),
      warehouseId: body.warehouseId,
      planId: body.planId,
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

    const items = await this.retrive.getArrivalStockList({
      skip: query.skip,
      take: query.take,
      orderId: Number(id),
    });

    const total = await this.retrive.getArrivalStockCount({
      orderId: Number(id),
    });

    return {
      items: items.map(item => {
        return Util.serialize({
          ...item,
          // TODO: plan ~ nonStoringQuantity
          plan: null,
          totalQuantity: 0,
          availableQuantity: 0,
          totalArrivalQuantity: 0,
          storingQuantity: 0,
          nonStoringQuantity: 0,
        })
      }),
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
      companyId: req.user.companyId,
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
    );
  }

  /** 매입/매출 보관 */
  @Post('/deposit')
  @UseGuards(AuthGuard)
  async createDepositOrder(
    @Request() req: AuthType,
    @Body() dto: OrderDepositCreateDto,
  ) {
    if (
      dto.srcCompanyId !== req.user.companyId &&
      dto.dstCompanyId !== req.user.companyId
    ) {
      throw new ForbiddenException(
        '매입처와 매출처 중 하나는 귀사로 지정되어야합니다.',
      );
    }

    const isOffer = dto.dstCompanyId === req.user.companyId;

    await this.change.createDepositOrder(
      dto.srcCompanyId,
      dto.dstCompanyId,
      isOffer,
      dto.productId,
      dto.packagingId,
      dto.grammage,
      dto.sizeX,
      dto.sizeY,
      dto.paperColorGroupId,
      dto.paperColorId,
      dto.paperPatternId,
      dto.paperCertId,
      dto.quantity,
      dto.memo,
    );
  }

  @Get('/:id/deposit')
  @UseGuards(AuthGuard)
  async getOrderDeposit(
    @Request() req: AuthType,
    @Param() idDto: IdDto,
  ): Promise<OrderDepositResponse> {
    const result = await this.retrive.getOrderDeposit(req.user.companyId, idDto.id);

    return {
      depositEvent: result ? Util.serialize(result) : null,
    }
  }

  @Post('/:id/deposit')
  @UseGuards(AuthGuard)
  async createOrderDeposit(
    @Request() req: AuthType,
    @Param() idDto: IdDto,
    @Body() dto: OrderDepositAssignDepositCreateDto,
  ) {
    await this.change.createOrderDeposit(req.user.companyId, idDto.id, dto.depositId, dto.quantity);
  }

  @Put('/:id/deposit')
  @UseGuards(AuthGuard)
  async updateOrderDeposit(
    @Request() req: AuthType,
    @Param() idDto: IdDto,
    @Body() dto: OrderDepositAssignDepositUpdateDto,
  ) {
    await this.change.updateOrderDeposit(req.user.companyId, idDto.id, dto.depositId, dto.quantity);
  }

  @Delete('/:id/deposit')
  @UseGuards(AuthGuard)
  async deleteOrderDeposit(
    @Request() req: AuthType,
    @Param() idDto: IdDto,
  ) {
    await this.change.deleteOrderDeposit(req.user.companyId, idDto.id);
  }

  /** 외주공정 */
  @Post('/process')
  @UseGuards(AuthGuard)
  async createOrderProcess(
    @Request() req: AuthType,
    @Body() dto: OrderProcessCreateDto,
  ) {
    const order = await this.change.createOrderProcess({
      companyId: req.user.companyId,
      ...dto,
    });
    return order;
  }

  /** 외주공정 상세 */
  @Get('/:id/process')
  @UseGuards(AuthGuard)
  async getOrderProcess(
    @Request() req: AuthType,
    @Param() idDto: IdDto,
  ): Promise<OrderProcessResponse> {
    const item = await this.retrive.getOrderProcess(req.user.companyId, idDto.id);

    return item;
  }

  /** 외주공정 수정 */
  @Put('/:id/process')
  @UseGuards(AuthGuard)
  async updateOrderProcess(
    @Request() req: AuthType,
    @Param() idDto: IdDto,
    @Body() dto: OrderProcessInfoUpdateDto,
  ): Promise<OrderCreateResponse> {
    const order = await this.change.updateOrderProcessInfo({
      companyId: req.user.companyId,
      orderId: idDto.id,
      ...dto,
    });

    return order;
  }

  /** 외주공정 원지 수정 */
  @Put('/:id/process/stock')
  @UseGuards(AuthGuard)
  async updateOrderProcessStock(
    @Request() req: AuthType,
    @Param() idDto: IdDto,
    @Body() dto: OrderProcessStockUpdateDto,
  ): Promise<OrderCreateResponse> {
    const order = await this.change.updateOrderProcessStock({
      companyId: req.user.companyId,
      orderId: idDto.id,
      ...dto,
    });
    return order;
  }

  /** 기타거래 */
  @Post('/etc')
  @UseGuards(AuthGuard)
  async createOrderEtc(
    @Request() req: AuthType,
    @Body() dto: OrderEtcCreateDto,
  ): Promise<OrderCreateResponse> {
    const order = await this.change.createOrderEtc({
      companyId: req.user.companyId,
      ...dto
    });

    return order;
  }

  /** 기타거래 상세 */
  @Get('/:id/etc')
  @UseGuards(AuthGuard)
  async getOrderEtc(
    @Request() req: AuthType,
    @Param() idDto: IdDto,
  ): Promise<OrderEtcResponse> {
    const item = await this.retrive.getOrderEtc(req.user.companyId, idDto.id);
    return item;
  }

  /** 기타거래 수정 */
  @Put('/:id/etc')
  @UseGuards(AuthGuard)
  async updateOrderEtc(
    @Request() req: AuthType,
    @Param() idDto: IdDto,
    @Body() dto: OrderEtcUpdateDto,
  ) {
    const order = await this.change.updateOrderEtc({
      companyId: req.user.companyId,
      orderId: idDto.id,
      ...dto,
    });

    return order;
  }
}
