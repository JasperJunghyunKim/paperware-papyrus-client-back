import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotImplementedException,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { OrderRequestChangeService } from '../service/order-rerquest.change.service';
import { OrderRequestRetriveService } from '../service/order-rerquest.retrive.service';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import {
  OrderRequestCreateDto,
  OrderRequestItemListDto,
} from './dto/order-request.request';
import {
  OrderRequestItemListResponse,
  OrderRequestResponse,
} from 'src/@shared/api/trade/order-request.response';
import { IdDto } from 'src/common/request';

@Controller('/order-request')
export class OrderRequestController {
  constructor(
    private readonly change: OrderRequestChangeService,
    private readonly retrive: OrderRequestRetriveService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(@Request() req: AuthType, @Body() dto: OrderRequestCreateDto) {
    return await this.change.create({
      userId: req.user.id,
      companyId: req.user.companyId,
      ...dto,
    });
  }

  /** 퀵주문 상품 목록 */
  @Get('/item')
  @UseGuards(AuthGuard)
  async getList(
    @Request() req: AuthType,
    @Query() query: OrderRequestItemListDto,
  ): Promise<OrderRequestItemListResponse> {
    if (
      req.user.companyId !== query.srcCompanyId &&
      req.user.companyId !== query.dstCompanyId
    )
      throw new BadRequestException(
        `srcCompany 또는 dstCompany가 자신의 회사로 지정되어야합니다.`,
      );

    return await this.retrive.getList({ ...query });
  }

  /** 퀵주문 상세 */
  @Get('/:id')
  @UseGuards(AuthGuard)
  async get(
    @Request() req: AuthType,
    @Param() idDto: IdDto,
  ): Promise<OrderRequestResponse> {
    return await this.retrive.get(req.user.companyId, idDto.id);
  }

  /** 읽음 처리 */
  @Patch('/:id/check')
  @UseGuards(AuthGuard)
  async check(@Request() req: AuthType, @Param() idDto: IdDto) {
    return await this.change.check(req.user.companyId, idDto.id);
  }
}
