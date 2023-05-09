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
  StockListRequestDto,
} from './dto/stock.request';
import { ulid } from 'ulid';
import { StockRetriveService } from '../service/stock-retrive.service';
import {
  StockDetailResponse,
  StockGroupListResponse,
  StockListResponse,
} from 'src/@shared/api/stock/stock.response';

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
      items: stocks.map(stock => ({
        id: stock.id,
        serial: stock.serial,
        company: stock.company,
        grammage: stock.grammage,
        sizeX: stock.sizeX,
        sizeY: stock.sizeY,
        totalQuantity: stock.cachedQuantity,
        availableQuantity: stock.cachedQuantityAvailable,
        isSyncPrice: stock.isSyncPrice,
        warehouse: stock.warehouse,
        product: stock.product,
        packaging: stock.packaging,
        paperColorGroup: stock.paperColorGroup,
        paperColor: stock.paperColor,
        paperPattern: stock.paperPattern,
        paperCert: stock.paperCert,
        stockPrice: null,
      })),
      total: stocks.length,
    };
  }

  @Get('/group')
  @UseGuards(AuthGuard)
  async getStockGroupList(
    @Request() req: AuthType,
    @Query() dto: StockGroupListRequestDto,
  ): Promise<StockGroupListResponse> {
    const { stockGroups, total } =
      await this.stockRetriveService.getStockGroupList(
        req.user.companyId,
        dto.skip,
        dto.take,
      );

    return {
      items: stockGroups.map((sg) => ({
        warehouse: sg.warehouseId
          ? {
            id: sg.warehouseId,
            name: sg.warehouseName,
            code: sg.warehouseCode,
            isPublic: sg.warehouseIsPublic,
            address: sg.warehouseAddress,
          }
          : null,
        product: {
          id: sg.productId,
          paperDomain: {
            id: sg.paperDomainId,
            name: sg.paperDomainName,
          },
          paperGroup: {
            id: sg.paperGroupId,
            name: sg.paperGroupName,
          },
          manufacturer: {
            id: sg.manufacturerId,
            name: sg.manufacturerName,
          },
          paperType: {
            id: sg.paperTypeId,
            name: sg.paperTypeName,
          },
        },
        packaging: {
          id: sg.packagingId,
          type: sg.packagingType,
          packA: sg.packagingPackA,
          packB: sg.packagingPackB,
        },
        grammage: sg.grammage,
        sizeX: sg.sizeX,
        sizeY: sg.sizeY,
        paperColorGroup: sg.paperColorGroupId
          ? {
            id: sg.paperColorGroupId,
            name: sg.paperColorGroupName,
          }
          : null,
        paperColor: sg.paperColorId
          ? {
            id: sg.paperColorId,
            name: sg.paperColorName,
          }
          : null,
        paperPattern: sg.paperPatternId
          ? {
            id: sg.paperPatternId,
            name: sg.paperPatternName,
          }
          : null,
        paperCert: sg.paperCertId
          ? {
            id: sg.paperCertId,
            name: sg.paperCertName,
          }
          : null,
        totalQuantity: sg.totalQuantity,
        availableQuantity: sg.availableQuantity,
      })),
      total,
    };
  }

  /** 재고 상세 */
  @Get('/:stockId')
  @UseGuards(AuthGuard)
  async get(@Request() req: AuthType, @Param() dto: GetStockDto): Promise<StockDetailResponse> {
    const stock = await this.stockRetriveService.getStock(req.user.companyId, dto.stockId);
    return {
      id: stock.id,
      serial: stock.serial,
      company: stock.company,
      grammage: stock.grammage,
      sizeX: stock.sizeX,
      sizeY: stock.sizeY,
      totalQuantity: stock.cachedQuantity,
      availableQuantity: stock.cachedQuantityAvailable,
      isSyncPrice: stock.isSyncPrice,
      warehouse: stock.warehouse,
      product: stock.product,
      packaging: stock.packaging,
      paperColorGroup: stock.paperColorGroup,
      paperColor: stock.paperColor,
      paperPattern: stock.paperPattern,
      paperCert: stock.paperCert,
      stockPrice: null,
    };
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
        sizeY: dto.sizeY,
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
}
