import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { StockChangeService } from '../service/stock-change.service';
import {
  ArrivalStockCreateRequestDto,
  GetStockDto,
  IdDto,
  StockCreateRequestDto,
  StockGroupDetailDto,
  StockGroupListRequestDto,
  StockGroupQuantityQueryDto,
  StockListRequestDto,
  StockQuantityChangeDto,
} from './dto/stock.request';
import { StockRetriveService } from '../service/stock-retrive.service';
import {
  StockDetailResponse,
  StockGroupDetailResponse,
  StockGroupListResponse,
  StockGroupQuantityResponse,
  StockListResponse,
} from 'src/@shared/api/stock/stock.response';
import { Util } from 'src/common';

@Controller('/stock')
export class StockController {
  constructor(
    private readonly stockChangeService: StockChangeService,
    private readonly stockRetriveService: StockRetriveService,
  ) { }

  @Post()
  @UseGuards(AuthGuard)
  async createStock(
    @Request() req: AuthType,
    @Body() dto: StockCreateRequestDto,
  ) {
    const stock = await this.stockChangeService.create({
      companyId: req.user.companyId,
      warehouseId: dto.warehouseId,
      productId: dto.productId,
      packagingId: dto.packagingId,
      grammage: dto.grammage,
      sizeX: dto.sizeX,
      sizeY: dto.sizeY,
      paperColorGroupId: dto.paperColorGroupId,
      paperColorId: dto.paperColorId,
      paperPatternId: dto.paperPatternId,
      paperCertId: dto.paperCertId,
      quantity: dto.quantity,
      price: dto.stockPrice,
    });
  }

  @Post('/arrival')
  @UseGuards(AuthGuard)
  async createArrivalStock(
    @Request() req: AuthType,
    @Body() dto: ArrivalStockCreateRequestDto,
  ) {
    const stock = await this.stockChangeService.createArrivalStock({
      companyId: req.user.companyId,
      ...dto,
    });
  }

  @Get()
  @UseGuards(AuthGuard)
  async getStockList(
    @Request() req: AuthType,
    @Query() dto: StockListRequestDto,
  ): Promise<StockListResponse> {
    const stocks = await this.stockRetriveService.getStockList({
      companyId: req.user.companyId,
      warehouseId: dto.warehouseId,
      productId: dto.productId,
      packagingId: dto.packagingId,
      grammage: dto.grammage,
      sizeX: dto.sizeX,
      sizeY: dto.sizeY,
      paperColorGroupId: dto.paperColorGroupId,
      paperColorId: dto.paperColorId,
      paperPatternId: dto.paperPatternId,
      paperCertId: dto.paperCertId,
      planId: dto.planId,
    });

    return {
      items: stocks.map(Util.serialize),
      total: stocks.length,
    };
  }

  @Get('/group')
  @UseGuards(AuthGuard)
  async getStockGroupList(
    @Request() req: AuthType,
    @Query() dto: StockGroupListRequestDto,
  ): Promise<StockGroupListResponse> {
    const result =
      await this.stockRetriveService.getStockGroupList(
        req.user.companyId,
        dto.skip,
        dto.take,
        dto.planId,
      );

    return result;
  }

  @Get('/group/detail')
  @UseGuards(AuthGuard)
  async getStockGroupDetail(
    @Request() req: AuthType,
    @Query() dto: StockGroupDetailDto,
  ): Promise<StockGroupDetailResponse> {
    const result = await this.stockRetriveService.getStockGroup({ ...dto });
    return result;
  }

  /** 재고그룹 수량 조회 */
  @Get('/group/quantity')
  @UseGuards(AuthGuard)
  async getStockGroupQuantity(
    @Request() req: AuthType,
    @Query() dto: StockGroupQuantityQueryDto,
  ): Promise<StockGroupQuantityResponse> {
    const result = await this.stockRetriveService.getStockGroupQuantity({ ...dto });

    return result;
  }

  /** 재고 증감 */
  @Post('/:id')
  @UseGuards(AuthGuard)
  async changeQuantity(
    @Request() req: AuthType,
    @Param() idDto: IdDto,
    @Body() dto: StockQuantityChangeDto,
  ) {
    await this.stockChangeService.changeStockQuantity(req.user.companyId, idDto.id, dto.quantity);
  }

  /** 재고 상세 */
  @Get('/:stockId')
  @UseGuards(AuthGuard)
  async get(
    @Request() req: AuthType,
    @Param() dto: GetStockDto,
  ): Promise<StockDetailResponse> {
    const stock = await this.stockRetriveService.getStock(
      req.user.companyId,
      dto.stockId,
    );
    return Util.serialize(stock);
  }
}
