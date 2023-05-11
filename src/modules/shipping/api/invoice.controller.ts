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
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { InvoiceChangeService } from '../service/invoice-change.service';
import { InvoiceRetriveService } from '../service/invoice-retrive.service';
import InvoiceListQueryDto, {
  InvoiceDisconnectShippingRequestDto,
} from './dto/invoice.request';
import { InvoiceListResponse } from 'src/@shared/api';

@Controller('invoice')
export class InvoiceController {
  constructor(
    private change: InvoiceChangeService,
    private retrive: InvoiceRetriveService,
  ) { }

  @Get()
  @UseGuards(AuthGuard)
  async getList(
    @Request() req: AuthType,
    @Query() query: InvoiceListQueryDto,
  ): Promise<InvoiceListResponse> {
    const items = await this.retrive.getList({
      skip: query.skip,
      take: query.take,
      companyId: req.user.companyId,
      shippingId: query.shippingId,
    });

    const total = await this.retrive.getCount({
      companyId: req.user.companyId,
      shippingId: query.shippingId,
    });

    return {
      items,
      total,
    };
  }

  @Post('disconnect')
  @UseGuards(AuthGuard)
  async disconnectShipping(
    @Request() req: AuthType,
    @Body() body: InvoiceDisconnectShippingRequestDto,
  ): Promise<void> {
    // TODO: 소유권 확인

    await this.change.disconnectShipping({
      invoiceIds: body.invoiceIds,
    });
  }
}
