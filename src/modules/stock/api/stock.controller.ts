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
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { StockChangeService } from '../service/stock-change.service';
import {
  GetStockDto,
  StockCreateRequestDto,
  StockGroupListRequestDto,
  StockGroupQuantityQueryDto,
  StockListRequestDto,
} from './dto/stock.request';
import { ulid } from 'ulid';
import { StockRetriveService } from '../service/stock-retrive.service';
import {
  StockDetailResponse,
  StockGroupListResponse,
  StockListResponse,
} from 'src/@shared/api/stock/stock.response';
import { Util } from 'src/common';
import { Model } from 'src/@shared';

@Controller('/stock')
export class StockController {
  constructor(
    private readonly stockChangeService: StockChangeService,
    private readonly stockRetriveService: StockRetriveService,
  ) { }

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
      );

    return result;
  }

  /** 재고 상세 */
  @Get('/:stockId')
  @UseGuards(AuthGuard)
  async get(
    @Request() req: AuthType,
    @Param() dto: GetStockDto,
  ): Promise<StockDetailResponse> {
    // const stock = await this.stockRetriveService.getStock(
    //   req.user.companyId,
    //   dto.stockId,
    // );
    // return Util.serialize(stock);
    return null;
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Request() req: AuthType,
    @Body() dto: StockCreateRequestDto,
  ): Promise<any> {
    await this.stockChangeService.create(
      {
        serial: ulid(),
        warehouse: dto.warehouseId
          ? {
            connect: {
              id: dto.warehouseId,
            },
          }
          : undefined,
        company: {
          connect: {
            id: req.user.companyId,
          },
        },
        product: {
          connect: {
            id: dto.productId,
          },
        },
        grammage: dto.grammage,
        sizeX: dto.sizeX,
        sizeY: dto.sizeY || 0,
        packaging: {
          connect: {
            id: dto.packagingId,
          },
        },
        paperColorGroup: dto.paperColorGroupId
          ? {
            connect: {
              id: dto.paperColorGroupId,
            },
          }
          : undefined,
        paperColor: dto.paperColorId
          ? {
            connect: {
              id: dto.paperColorId,
            },
          }
          : undefined,
        paperPattern: dto.paperPatternId
          ? {
            connect: {
              id: dto.paperPatternId,
            },
          }
          : undefined,
        paperCert: dto.paperCertId
          ? {
            connect: {
              id: dto.paperCertId,
            },
          }
          : undefined,
      },
      {
        ...dto.stockPrice,
        stock: undefined,
      },
      dto.quantity,
    );
  }

  @Get('group/quantity')
  @UseGuards(AuthGuard)
  async getGroupItem(
    @Request() req: AuthType,
    @Query() dto: StockGroupQuantityQueryDto,
  ): Promise<Model.StockQuantity> {
    // TODO: 권한
    return await this.stockRetriveService.getStockGroupQuantity({
      warehouseId: dto.warehouseId,
      initialOrderId: dto.initialOrderId,
      productId: dto.productId,
      grammage: dto.grammage,
      sizeX: dto.sizeX,
      sizeY: dto.sizeY,
      packagingId: dto.packagingId,
      paperColorGroupId: dto.paperColorGroupId,
      paperColorId: dto.paperColorId,
      paperPatternId: dto.paperPatternId,
      paperCertId: dto.paperCertId,
    });
  }
}
