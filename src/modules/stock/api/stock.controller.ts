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
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { StockChangeService } from '../service/stock-change.service';
import {
  ArrivalStockCreateRequestDto,
  ArrivalStockDeleteDto,
  ArrivalStockPriceUpdateDto,
  ArrivalStockSpecUpdateDto,
  GetStockBySerialDto,
  GetStockDto,
  IdDto,
  StockCreateRequestDto,
  StockGroupDetailDto,
  StockGroupHistoryDto,
  StockGroupListRequestDto,
  StockGroupQuantityQueryDto,
  StockListRequestDto,
  StockQuantityChangeDto,
} from './dto/stock.request';
import { StockRetriveService } from '../service/stock-retrive.service';
import {
  PlanStockGroupListResponse,
  StockDetailResponse,
  StockGroupDetailResponse,
  StockGroupHistoryResponse,
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
  ) {}

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
    const stocks = await this.stockRetriveService.getStockList(
      {
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
        initialPlanId: dto.initialPlanId || undefined,
      },
      dto.isZeroQuantityIncluded === 'true',
    );

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
    const result = await this.stockRetriveService.getStockGroupList({
      companyId: req.user.companyId,
      ...dto,
      isDirectShippingIncluded: dto.isDirectShippingIncluded === 'true',
      isZeroQuantityIncluded: dto.isZeroQuantityIncluded === 'true',
      planId: dto.planId || null,
      initialPlanId: dto.initialPlanId || null,
      // 검색 필드
      warehouseIds: Util.searchKeywordsToIntArray(dto.warehouseIds),
      packagingIds: Util.searchKeywordsToIntArray(dto.packagingIds),
      paperTypeIds: Util.searchKeywordsToIntArray(dto.paperTypeIds),
      manufacturerIds: Util.searchKeywordsToIntArray(dto.manufacturerIds),
    });

    return result;
  }

  @Get('/group/history')
  @UseGuards(AuthGuard)
  async getStockGroupHistories(
    @Request() req: AuthType,
    @Query() dto: StockGroupHistoryDto,
  ): Promise<StockGroupHistoryResponse> {
    const result = await this.stockRetriveService.getStockGroupHistories({
      companyId: req.user.companyId,
      ...dto,
      sizeY: dto.sizeY || 0,
    });

    return Util.serialize(result);
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
    const result = await this.stockRetriveService.getStockGroupQuantity({
      ...dto,
    });

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
    await this.stockChangeService.changeStockQuantity(
      req.user.companyId,
      idDto.id,
      dto.quantity,
    );
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

  /** 재고 상세 (재고번호) */
  @Get('/by-serial/:serial')
  @UseGuards(AuthGuard)
  async getBySerial(
    @Request() req: AuthType,
    @Param() dto: GetStockBySerialDto,
  ): Promise<StockDetailResponse> {
    const stock = await this.stockRetriveService.getStockBySerial(
      req.user.companyId,
      dto.serial,
    );
    return Util.serialize(stock);
  }

  /** plan의 재고그룹 */
  @Get('/group/plan/:id')
  @UseGuards(AuthGuard)
  async getPlanStockGroups(
    @Request() req: AuthType,
    @Param() idDto: IdDto,
  ): Promise<PlanStockGroupListResponse> {
    const stockGroups = await this.stockRetriveService.getPlanStockGroups(
      req.user.companyId,
      idDto.id,
    );
    return {
      items: stockGroups.map((sg) => Util.serialize(sg)),
      total: stockGroups.length,
    };
  }

  /** 도착예정재고 금액 수정 */
  @Put('/arrival/price')
  @UseGuards(AuthGuard)
  async updateArrivalStockPrice(
    @Request() req: AuthType,
    @Body() dto: ArrivalStockPriceUpdateDto,
  ) {
    dto.validate();
    return await this.stockChangeService.updateArrivalStockPrice({
      companyId: req.user.companyId,
      ...dto,
      sizeY: dto.sizeY || 0,
    });
  }

  /** 도착예정재고 스펙 수정 */
  @Put('/arrival')
  @UseGuards(AuthGuard)
  async updateArrivalStockSpec(
    @Request() req: AuthType,
    @Body() dto: ArrivalStockSpecUpdateDto,
  ) {
    return await this.stockChangeService.updateArrivalStockSpec({
      companyId: req.user.companyId,
      ...dto,
      sizeY: dto.sizeY || 0,
      spec: {
        ...dto.spec,
        sizeY: dto.spec.sizeY || 0,
      },
    });
  }

  /** 도착예정재고 삭제 */
  @Delete('/arrival')
  @UseGuards(AuthGuard)
  async deleteArrivalStock(
    @Request() req: AuthType,
    @Query() dto: ArrivalStockDeleteDto,
  ) {
    return await this.stockChangeService.deleteArrivalStock({
      companyId: req.user.companyId,
      ...dto,
      sizeY: dto.sizeY || 0,
    });
  }
}
