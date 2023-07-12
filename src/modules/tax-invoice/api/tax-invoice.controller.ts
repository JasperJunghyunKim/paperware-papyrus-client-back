import {
  Body,
  Controller,
  Delete,
  Get,
  NotImplementedException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { TaxInvoiceChangeService } from '../service/tax-invoice.change.service';
import { TaxInvoiceRetriveService } from '../service/tax-invoice.retrive.service';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import {
  AddOrderToTaxInvoiceDto,
  CreateTaxInvoiceRequestDto,
  GetTaxInvoiceListQueryDto,
  UpdateTaxInvoiceRequestDto,
} from './dto/tax-invoice.request';
import {
  CreateTaxInvoiceResponse,
  GetTaxInvoiceItemResponse,
  GetTaxInvoiceListResponse,
  TaxInvoiceOrderListResponse,
  UpdateTaxInvoiceResponse,
} from 'src/@shared/api';
import { Util } from 'src/common';
import { IdDto } from 'src/common/request';

@Controller('tax-invoice')
export class TaxInvoiceController {
  constructor(
    private changeService: TaxInvoiceChangeService,
    private retriveService: TaxInvoiceRetriveService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async getTaxInvoiceList(
    @Req() req: AuthType,
    @Query() query: GetTaxInvoiceListQueryDto,
  ): Promise<GetTaxInvoiceListResponse> {
    const items = await this.retriveService.getTaxInvoiceList({
      companyId: req.user.companyId,
      skip: query.skip,
      take: query.take,
    });

    const total = await this.retriveService.getTaxInvoiceCount({
      companyId: req.user.companyId,
    });

    return Util.serialize({ items, total });
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getTaxInvoiceItem(
    @Req() req: AuthType,
    @Param('id') id: number,
  ): Promise<GetTaxInvoiceItemResponse> {
    const item = await this.retriveService.getTaxInvoiceItem({
      companyId: req.user.companyId,
      id,
    });

    return item;
  }

  @Post()
  @UseGuards(AuthGuard)
  async createTaxInvoice(
    @Req() req: AuthType,
    @Body() body: CreateTaxInvoiceRequestDto,
  ): Promise<CreateTaxInvoiceResponse> {
    const id = await this.changeService.createTaxInvoice({
      ...body,
      srcCompanyId: body.companyId,
      companyId: req.user.companyId,
    });

    return Util.serialize({ id });
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async updateTaxInvoice(
    @Req() req: AuthType,
    @Param('id') id: number,
    @Body() body: UpdateTaxInvoiceRequestDto,
  ): Promise<UpdateTaxInvoiceResponse> {
    const data = await this.changeService.updateTaxInvoice({
      companyId: req.user.companyId,
      id,
      ...body,
    });

    return Util.serialize({ id: data });
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteTaxInvoice(@Req() req: AuthType, @Param('id') id: number) {
    await this.changeService.deleteTaxInvoice({
      companyId: req.user.companyId,
      id,
    });
  }

  /** 매출 목록 */
  @Get('/:id/order')
  @UseGuards(AuthGuard)
  async getOrders(
    @Req() req: AuthType,
    @Param() idDto: IdDto,
  ): Promise<TaxInvoiceOrderListResponse> {
    const items = await this.retriveService.getOrders(
      req.user.companyId,
      idDto.id,
    );
    return {
      items,
      total: items.length,
    };
  }

  /** 매출 추가 */
  @Post('/:id/order')
  @UseGuards(AuthGuard)
  async addOrder(
    @Req() req: AuthType,
    @Param() idDto: IdDto,
    @Body() body: AddOrderToTaxInvoiceDto,
  ) {
    await this.changeService.addOrder(
      req.user.companyId,
      idDto.id,
      body.orderIds,
    );
  }

  /** 매출 삭제 */
  @Delete('/:id/order')
  @UseGuards(AuthGuard)
  async delteOrder(
    @Req() req: AuthType,
    @Param() idDto: IdDto,
    @Body() body: AddOrderToTaxInvoiceDto,
  ) {
    await this.changeService.deleteOrder(
      req.user.companyId,
      idDto.id,
      body.orderIds,
    );
  }
}
