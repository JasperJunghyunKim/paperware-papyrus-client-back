import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotImplementedException,
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
  OrderRequestListDto,
} from './dto/order-request.request';
import { OrderRequestListResponse } from 'src/@shared/api/trade/order-request.response';

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

  @Get()
  @UseGuards(AuthGuard)
  async getList(
    @Request() req: AuthType,
    @Query() query: OrderRequestListDto,
  ): Promise<OrderRequestListResponse> {
    if (
      req.user.companyId !== query.srcCompanyId &&
      req.user.companyId !== query.dstCompanyId
    )
      throw new BadRequestException(
        `srcCompany 또는 dstCompany가 자신의 회사로 지정되어야합니다.`,
      );

    return await this.retrive.getList({ ...query });
  }
}
