import {
  Controller,
  Get,
  UseGuards,
  Request,
  Query,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import { ShippingChangeService } from '../service/shipping-change.service';
import { ShippingRetriveService } from '../service/shipping-retrive.service';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import {
  ShippingConnectInvoicesRequestDto,
  ShippingCreateRequestDto,
  ShippingListQueryDto,
} from './dto/shipping.request';
import { ShippingListResponse } from 'src/@shared/api';

@Controller('shipping')
export class ShippingController {
  constructor(
    private change: ShippingChangeService,
    private retrive: ShippingRetriveService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async getList(
    @Request() req: AuthType,
    @Query() query: ShippingListQueryDto,
  ): Promise<ShippingListResponse> {
    const items = await this.retrive.getList({
      skip: query.skip,
      take: query.take,
      companyId: req.user.companyId,
    });

    const total = await this.retrive.getCount({
      companyId: req.user.companyId,
    });

    return {
      items,
      total,
    };
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Request() req: AuthType,
    @Body() body: ShippingCreateRequestDto,
  ): Promise<void> {
    await this.change.create({
      companyId: req.user.companyId,
    });
  }

  @Post(':id/invoice/connect')
  @UseGuards(AuthGuard)
  async connectInvoice(
    @Request() req: AuthType,
    @Param('id') id: number,
    @Body() body: ShippingConnectInvoicesRequestDto,
  ): Promise<void> {
    // TODO: 소유권 확인

    await this.change.connectInvoices({
      shippingId: id,
      invoiceIds: body.invoiceIds,
    });
  }
}
