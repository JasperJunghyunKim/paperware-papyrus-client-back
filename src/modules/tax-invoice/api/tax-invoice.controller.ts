import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
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
  TaxInvoiceIssueResponse,
  TaxInvoiceOrderListResponse,
  UpdateTaxInvoiceResponse,
} from 'src/@shared/api';
import { Util } from 'src/common';
import { IdDto } from 'src/common/request';
import { PopbillRetriveService } from 'src/modules/popbill/service/popbill.retrive.service';
import { PopbillChangeService } from 'src/modules/popbill/service/popbill.change.service';

@Controller('tax-invoice')
export class TaxInvoiceController {
  constructor(
    private changeService: TaxInvoiceChangeService,
    private retriveService: TaxInvoiceRetriveService,
    private readonly popbillRetriveService: PopbillRetriveService,
    private readonly popbillChangeService: PopbillChangeService,
  ) {}

  @Get('test')
  async test() {
    return await this.popbillRetriveService.checkCertValidation('1234567890');
  }

  /** 인증서 URL */
  @Get('/cert/url')
  @UseGuards(AuthGuard)
  async getCerUrl(@Req() req: AuthType) {
    return await this.popbillRetriveService.getCertUrl(req.user.companyId);
  }

  /** 발행 */
  @Post('/:id/issue')
  @UseGuards(AuthGuard)
  async issueTaxInvoice(
    @Req() req: AuthType,
    @Param() param: IdDto,
  ): Promise<TaxInvoiceIssueResponse> {
    // throw new NotImplementedException();
    return await this.changeService.issueTaxInvoice(
      req.user.companyId,
      param.id,
    );
  }

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
      userId: req.user.id,
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
