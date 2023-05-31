import { Injectable } from '@nestjs/common';
import {
  PackagingType,
  Prisma,
} from '@prisma/client';
import { PrismaService } from 'src/core';
import { StockError } from '../infrastructure/constants/stock-error.enum';
import { StockNotFoundException } from '../infrastructure/exception/stock-notfound.exception';
import { Selector } from 'src/common';

interface StockGroupFromDB {
  stockGroupId: number;
  warehouseId: number;
  warehouseName: string;
  warehouseCode: string;
  warehouseIsPublic: boolean;
  warehouseAddress: string;

  // 메타데이터
  packagingId: number;
  packagingName: string;
  packagingType: PackagingType;
  packagingPackA: number;
  packagingPackB: number;

  productId: number;
  paperDomainId: number;
  paperDomainName: string;
  paperGroupId: number;
  paperGroupName: string;
  manufacturerId: number;
  manufacturerName: string;
  paperTypeId: number;
  paperTypeName: string;

  grammage: number;
  sizeX: number;
  sizeY: number;

  paperColorGroupId: number;
  paperColorGroupName: string;
  paperColorId: number;
  paperColorName: string;
  paperPatternId: number;
  paperPatternName: string;
  paperCertId: number;
  paperCertName: string;

  // 도착예정 정보
  orderStockId: number;
  orderId: number;
  dstLocationId: number;
  dstLocationName: string;
  dstLocationCode: string;
  dstLocationIsPublic: boolean;
  dstLocationAddress: string;
  wantedDate: string;

  planId: number;
  planNo: string;

  // 원지정보
  osWarehouseId: number;
  osWarehouseName: string;
  osWarehouseCode: string;
  osWarehouseIsPublic: boolean;
  osWarehouseAddress: string;

  orderStockProductId: number;
  orderStockPaperDomainId: number;
  orderStockPaperDomainName: string;
  orderStockManufacturerId: number;
  orderStockManufacturerName: string;
  orderStockPaperGroupId: number;
  orderStockPaperGroupName: string;
  orderStockPaperTypeId: number;
  orderStockPaperTypeName: string;
  orderStockPackagingId: number;
  orderStockPackagingName: string;
  orderStockPackagingType: PackagingType;
  orderStockPackagingPackA: number;
  orderStockPackagingPackB: number;
  orderStockPaperColorGroupId: number;
  orderStockPaperColorGroupName: string;
  orderStockPaperColorId: number;
  orderStockPaperColorName: string;
  orderStockPaperPatternId: number;
  orderStockPaperPatternName: string;
  orderStockPaperCertId: number;
  orderStockPaperCertName: string;
  orderStockGrammage: number;
  orderStockSizeX: number;
  orderStockSizeY: number;
  orderStockQuantity: number;

  // 거래처 정보
  partnerCompanyId: number;
  partnerCompanyBusinessName: string;
  partnerCompanyCompanyRegistrationNumber: string;
  partnerCompanyInvoiceCode: string;
  partnerCompanyRepresentative: string;
  partnerCompanyAddress: string;
  partnerCompanyPhoneNo: string;
  partnerCompanyFaxNo: string;
  partnerCompanyEmail: string;
  partnerCompanyManagedById: number;

  totalQuantity: number;
  availableQuantity: number;
  total: bigint;
}

@Injectable()
export class StockRetriveService {
  constructor(private readonly prisma: PrismaService) { }

  async getStockList(data: Prisma.StockWhereInput) {
    const stocks = await this.prisma.stock.findMany({
      include: {
        warehouse: {
          include: {
            company: true,
          },
        },
        company: true,
        product: {
          include: {
            paperDomain: true,
            manufacturer: true,
            paperGroup: true,
            paperType: true,
          },
        },
        packaging: true,
        paperColorGroup: true,
        paperColor: true,
        paperPattern: true,
        paperCert: true,
        stockPrice: true,
        initialOrder: {
          select: Selector.INITIAL_ORDER,
        },
      },
      where: {
        ...data,
        isDeleted: false,
      },
    });

    for (const stock of stocks) {
      delete stock.warehouseId;
      delete stock.isDeleted;
      delete stock.productId;
      delete stock.packagingId;
      delete stock.paperColorGroupId;
      delete stock.paperColorId;
      delete stock.paperPatternId;
      delete stock.paperCertId;
      delete stock.product.paperDomainId;
      delete stock.product.manufacturerId;
      delete stock.product.paperGroupId;
      delete stock.product.paperTypeId;
    }

    return stocks;
  }

  async getStockGroupList(companyId: number, skip: number, take: number) {

  }

  async getStockGroupQuantity(params: {
    warehouseId: number | null;
    initialOrderId: number | null;
    productId: number | null;
    packagingId: number | null;
    grammage: number | null;
    sizeX: number | null;
    sizeY: number | null;
    paperColorGroupId: number | null;
    paperColorId: number | null;
    paperPatternId: number | null;
    paperCertId: number | null;
  }) {
    const quantity = await this.prisma.stockEvent.findMany({
      where: {
        stock: {
          warehouseId: params.warehouseId,
          initialOrderId: params.initialOrderId,
          productId: params.productId,
          packagingId: params.packagingId,
          grammage: params.grammage,
          sizeX: params.sizeX,
          sizeY: params.sizeY,
          paperColorGroupId: params.paperColorGroupId,
          paperColorId: params.paperColorId,
          paperPatternId: params.paperPatternId,
          paperCertId: params.paperCertId,
        },
      },
      select: {
        change: true,
        status: true,
      },
    });

    const availableQuantity = quantity.reduce((acc, cur) => {
      return acc + (cur.status !== 'CANCELLED' ? cur.change : 0);
    }, 0);

    const totalQuantity = quantity.reduce((acc, cur) => {
      return acc + (cur.status === 'NORMAL' ? cur.change : 0);
    }, 0);

    return {
      availableQuantity,
      totalQuantity,
    };
  }
}
