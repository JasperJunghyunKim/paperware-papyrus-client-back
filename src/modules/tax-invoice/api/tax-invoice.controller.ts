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
  CreateTaxInvoiceRequestDto,
  GetTaxInvoiceListQueryDto,
  UpdateTaxInvoiceRequestDto,
} from './dto/tax-invoice.request';
import {
  CreateTaxInvoiceResponse,
  GetTaxInvoiceListResponse,
  UpdateTaxInvoiceResponse,
} from 'src/@shared/api';
import { Util } from 'src/common';

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
  async getTaxInvoiceItem(@Req() req: AuthType, @Param('id') id: number) {
    const item = await this.retriveService.getTaxInvoiceItem({
      id,
    });

    if (item.companyId !== req.user.companyId) {
      throw new UnauthorizedException('Invalid company');
    }

    return Util.serialize(item);
  }

  @Post()
  @UseGuards(AuthGuard)
  async createTaxInvoice(
    @Req() req: AuthType,
    @Body() body: CreateTaxInvoiceRequestDto,
  ): Promise<CreateTaxInvoiceResponse> {
    const id = await this.changeService.createTaxInvoice({
      companyId: req.user.companyId,
      companyRegistrationNumber: body.companyRegistrationNumber,
      writeDate: body.writeDate,
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
    throw new NotImplementedException();
    await this.changeService.deleteTaxInvoice({
      id,
    });
  }
}
