import {
  Controller,
  Get,
  UseGuards,
  Request,
  Query,
  Post,
  Body,
  Param,
  Delete,
  Put,
  NotImplementedException,
  Patch,
} from '@nestjs/common';
import { ShippingChangeService } from '../service/shipping-change.service';
import { ShippingRetriveService } from '../service/shipping-retrive.service';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import {
  ShippingAssignMangerDto,
  ShippingConnectInvoicesRequestDto,
  ShippingCreateRequestDto,
  ShippingListQueryDto,
  ShippingUpdateDto,
} from './dto/shipping.request';
import {
  ShippingCreateResponse,
  ShippingListResponse,
  ShippingResponse,
  ShippingUpdateResponse,
} from 'src/@shared/api';
import { IdDto } from 'src/common/request';
import { Util } from 'src/common';
import { InvoiceStatus } from '@prisma/client';

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
      invoiceStatus: Util.searchKeywordsToStringArray(
        query.invoiceStatus,
      ) as InvoiceStatus[],
    });

    const total = await this.retrive.getCount({
      companyId: req.user.companyId,
      invoiceStatus: Util.searchKeywordsToStringArray(
        query.invoiceStatus,
      ) as InvoiceStatus[],
    });

    return {
      items,
      total,
    };
  }

  @Get('/:id')
  @UseGuards(AuthGuard)
  async get(
    @Request() req: AuthType,
    @Param() param: IdDto,
  ): Promise<ShippingResponse> {
    const item = await this.retrive.get(req.user.companyId, param.id);
    return item;
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Request() req: AuthType,
    @Body() body: ShippingCreateRequestDto,
  ): Promise<ShippingCreateResponse> {
    body.validate();
    return await this.change.create({
      userId: req.user.id,
      companyId: req.user.companyId,
      ...body,
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

  @Post(':id/forward')
  @UseGuards(AuthGuard)
  async forward(
    @Request() req: AuthType,
    @Param('id') id: number,
  ): Promise<void> {
    await this.change.forward({
      shippingId: id,
    });
  }

  @Post(':id/backward')
  @UseGuards(AuthGuard)
  async backward(
    @Request() req: AuthType,
    @Param('id') id: number,
  ): Promise<void> {
    await this.change.backward({
      shippingId: id,
    });
  }

  @Delete('/:id')
  @UseGuards(AuthGuard)
  async delete(@Request() req: AuthType, @Param() idDto: IdDto) {
    await this.change.delete(req.user.companyId, idDto.id);
  }

  @Put('/:id')
  @UseGuards(AuthGuard)
  async updateShipping(
    @Request() req: AuthType,
    @Param() param: IdDto,
    @Body() body: ShippingUpdateDto,
  ): Promise<ShippingUpdateResponse> {
    return await this.change.update({
      companyId: req.user.companyId,
      shippingId: param.id,
      ...body,
    });
  }

  /** 담당자 배정 취소 */
  @Delete('/:id/manager')
  @UseGuards(AuthGuard)
  async unassignManager(@Request() req: AuthType, @Param() param: IdDto) {
    return await this.change.unassignManager(req.user.companyId, param.id);
  }

  /** 담당자 배정 */
  @Patch('/:id/manager')
  @UseGuards(AuthGuard)
  async assignManager(
    @Request() req: AuthType,
    @Param() param: IdDto,
    @Body() body: ShippingAssignMangerDto,
  ) {
    return await this.change.assignManager(
      req.user.companyId,
      param.id,
      body.managerId,
    );
  }
}
