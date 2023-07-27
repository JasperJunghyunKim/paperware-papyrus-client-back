import {
  Controller,
  Get,
  UseGuards,
  Request,
  Query,
  Post,
  Body,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { InvoiceChangeService } from '../service/invoice-change.service';
import { InvoiceRetriveService } from '../service/invoice-retrive.service';
import InvoiceListQueryDto, {
  InvoiceDisconnectShippingRequestDto,
  UpdateInvoiceStatusDto,
} from './dto/invoice.request';
import { InvoiceListResponse } from 'src/@shared/api';
import { Model } from 'src/@shared';

@Controller('invoice')
export class InvoiceController {
  constructor(
    private change: InvoiceChangeService,
    private retrive: InvoiceRetriveService,
  ) {}

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
      planId: query.planId,
    });

    const total = await this.retrive.getCount({
      companyId: req.user.companyId,
      shippingId: query.shippingId,
      planId: query.planId,
    });

    return {
      items,
      total,
    };
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getById(
    @Request() req: AuthType,
    @Param('id') id: number,
  ): Promise<Model.Invoice> {
    const invoice = await this.retrive.getById(id);

    if (req.user.companyId !== invoice.plan.company.id) {
      throw new BadRequestException('조회 권한이 없습니다.');
    }

    return invoice;
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

  @Post('/forward')
  @UseGuards(AuthGuard)
  async forwardInvoiceStatus(
    @Request() req: AuthType,
    @Body() dto: UpdateInvoiceStatusDto,
  ) {
    await this.change.forwardInvoiceStatus(req.user.companyId, dto.invoiceIds);
  }

  @Post('/backward')
  @UseGuards(AuthGuard)
  async backwardInvoiceStatus(
    @Request() req: AuthType,
    @Body() dto: UpdateInvoiceStatusDto,
  ) {
    await this.change.backwardInvoiceStatus(req.user.companyId, dto.invoiceIds);
  }

  @Post('/cancel')
  @UseGuards(AuthGuard)
  async cancelInvoiceStatus(
    @Request() req: AuthType,
    @Body() dto: UpdateInvoiceStatusDto,
  ) {
    await this.change.cancelInvoice(req.user.companyId, dto.invoiceIds);
  }
}
