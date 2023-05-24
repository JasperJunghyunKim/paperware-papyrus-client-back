import {
  Body,
  Controller,
  Get,
  NotImplementedException,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Api } from 'src/@shared';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { StockArrivalChangeService } from '../service/stock-arrival-change.service';
import { StockArrivalRetriveService } from '../service/stock-arrival-retrive.service';
import { StockArrivalApplyDto, StockArrivalListQueryDto } from './dto/stock-arrival.request';

@Controller('/stock-arrival')
export class StockArrivalController {
  constructor(
    private readonly change: StockArrivalChangeService,
    private readonly retrive: StockArrivalRetriveService,
  ) { }

  @Get()
  @UseGuards(AuthGuard)
  async getStockArrivalList(
    @Request() req: AuthType,
    @Query() query: StockArrivalListQueryDto,
  ): Promise<Api.OrderStockArrivalListResponse> {
    const items = await this.retrive.getStockArrivalList({
      companyId: req.user.companyId,
      skip: query.skip,
      take: query.take,
    });

    const total = await this.retrive.getStockArrivalCount({
      companyId: req.user.companyId,
    });

    return { items, total };
  }

  @Post(':stockGroupId/apply')
  @UseGuards(AuthGuard)
  async applyStockArrival(
    @Request() req: AuthType,
    @Param('stockGroupId') stockGroupId: number,
    @Body() dto: StockArrivalApplyDto,
  ): Promise<any> {
    // TODO: 권한 체크
    // throw new NotImplementedException();
    await this.change.applyStockArrival(stockGroupId, req.user.companyId, dto.warehouseId);
  }
}
