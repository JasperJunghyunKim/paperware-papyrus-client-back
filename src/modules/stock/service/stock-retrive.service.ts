import { Injectable } from '@nestjs/common';
import { PackagingType, Prisma, StockEventStatus } from '@prisma/client';
import { PrismaService } from 'src/core';
import { StockError } from '../infrastructure/constants/stock-error.enum';
import { StockNotFoundException } from '../infrastructure/exception/stock-notfound.exception';

interface StockGroupFromDB {
  warehouseId: number;
  warehouseName: string;
  warehouseCode: string;
  warehouseIsPublic: boolean;
  warehouseAddress: string;

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

  orderId: number;
  orderStockId: number;
  dstLocationId: number;
  dstLocationCode: string;
  dstLocationName: string;
  dstLocationAddress: string;
  dstLocationIsPublic: boolean;

  partnerCompanyId: number;
  partnerCompanyBusinessName: string;
  partnerCompanyCompanyregistrationstring: string;
  partnerCompanyPhoneNo: string;
  partnerCompanyFaxNo: string;
  partnerCompanyEmail: string;
  partnerCompanyAddress: string;

  sgWarehouseId: number;
  sgWarehouseName: string;
  sgWarehouseCode: string;
  sgWarehouseAddress: string;
  sgWarehouseIsPublic: boolean;

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

  planId: number;
  planNo: string;

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
          }
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
    const limit = take ? Prisma.sql`LIMIT ${skip}, ${take}` : Prisma.empty;

    const stockGroups: StockGroupFromDB[] = await this.prisma.$queryRaw`
            SELECT
                    s.warehouseId AS warehouseId
                    , w.name AS warehouseName
                    , w.code AS warehouseCode
                    , w.isPublic AS warehouseIsPublic
                    , w.address AS warehouseAddress

                    , product.id AS productId
                    , paperDomain.id AS paperDomainId
                    , paperDomain.name AS paperDomainName
                    , manufacturer.id AS manufacturerId
                    , manufacturer.name AS manufacturerName
                    , paperGroup.id AS paperGroupId
                    , paperGroup.name AS paperGroupName
                    , paperType.id AS paperTypeId
                    , paperType.name AS paperTypeName
                    , packaging.id AS packagingId
                    , packaging.name AS packagingName
                    , packaging.type AS packagingType
                    , packaging.packA AS packagingPackA
                    , packaging.packB AS packagingPackB
                    , paperColorGroup.id AS paperColorGroupId
                    , paperColorGroup.name AS paperColorGroupName
                    , paperColor.id AS paperColorId
                    , paperColor.name AS paperColorName
                    , paperPattern.id AS paperPatternId
                    , paperPattern.name AS paperPatternName
                    , paperCert.id AS paperCertId
                    , paperCert.name AS paperCertName
                    , s.grammage AS grammage
                    , s.sizeX AS sizeX
                    , s.sizeY AS sizeY

                    # 주문정보 및 거래처 정보
                    , o.id AS orderId
                    , os.id AS orderStockId

                    , dstLocation.id AS dstLocationId
                    , dstLocation.code AS dstLocationCode
                    , dstLocation.name AS dstLocationName
                    , dstLocation.address AS dstLocationAddress
                    , dstLocation.isPublic AS dstLocationIsPublic
                    
                    , partnerCompany.id AS partnerCompanyId
                    , partnerCompany.businessName AS partnerCompanyBusinessName
                    , partnerCompany.companyRegistrationNumber AS partnerCompanyCompanyregistrationNumber
                    , partnerCompany.phoneNo As partnerCompanyPhoneNo
                    , partnerCompany.faxNo As partnerCompanyFaxNo
                    , partnerCompany.email AS partnerCompanyEmail
                    , partnerCompany.address AS partnerCompanyAddress

                    , sgWarehouse.id AS sgWarehouseId
                    , sgWarehouse.name AS sgWarehouseName
                    , sgWarehouse.code AS sgWarehouseCode
                    , sgWarehouse.address AS sgWarehouseAddress
                    , sgWarehouse.isPublic AS sgWarehouseIsPublic

                    # 주문 원지 정보
                    , osProduct.id AS orderStockProductId
                    , osPaperDomain.id AS orderStockPaperDomainId
                    , osPaperDomain.name AS orderStockPaperDomainName
                    , osManufacturer.id AS orderStockManufacturerId
                    , osManufacturer.name AS orderStockManufacturerName
                    , osPaperGroup.id AS orderStockPaperGroupId
                    , osPaperGroup.name AS orderStockPaperGroupName
                    , osPaperType.id AS orderStockPaperTypeId
                    , osPaperType.name AS orderStockPaperTypeName
                    , osPackaging.id AS orderStockPackagingId
                    , osPackaging.name AS orderStockPackagingName
                    , osPackaging.type AS orderStockPackagingType
                    , osPackaging.packA AS orderStockPackagingPackA
                    , osPackaging.packB AS orderStockPackagingPackB
                    , osPaperColorGroup.id AS orderStockPaperColorGroupId
                    , osPaperColorGroup.name AS orderStockPaperColorGroupName
                    , osPaperColor.id AS orderStockPaperColorId
                    , osPaperColor.name AS orderStockPaperColorName
                    , osPaperPattern.id AS orderStockPaperPatternId
                    , osPaperPattern.name AS orderStockPaperPatternName
                    , osPaperCert.id AS orderStockPaperCertId
                    , osPaperCert.name AS orderStockPaperCertName
                    , os.grammage AS orderStockGrammage
                    , os.sizeX AS orderStockSizeX
                    , os.sizeY AS orderStockSizeY
                    , osStockEvent.change AS orderStockQuantity

                    # 플랜
                    , p.id AS planId
                    , p.planNo AS planNo

                    , IFNULL(SUM(s.cachedQuantity), 0) / IF(packaging.type = ${PackagingType.ROLL}, 1000000, 1) AS totalQuantity
                    , IFNULL(SUM(s.cachedQuantityAvailable), 0) / IF(packaging.type = ${PackagingType.ROLL}, 1000000, 1) AS availableQuantity
                    , COUNT(1) OVER() AS total

              FROM Stock                    AS s
              JOIN StockEvent               AS se               ON se.stockId = s.id
         LEFT JOIN Warehouse                AS w                ON w.id = s.warehouseId

            # 메타데이터
              JOIN Product                  AS product          ON product.id = s.productId
              JOIN PaperDomain              AS paperDomain      ON paperDomain.id = product.paperDomainId
              JOIN Manufacturer             AS manufacturer     ON manufacturer.id = product.manufacturerId
              JOIN PaperGroup               AS paperGroup       ON paperGroup.id = product.paperGroupId
              JOIN PaperType                AS paperType        ON paperType.id = product.paperTypeId
              JOIN Packaging                AS packaging        ON packaging.id = s.packagingId
         LEFT JOIN PaperColorGroup          AS paperColorGroup  ON paperColorGroup.id = s.paperColorGroupId
         LEFT JOIN PaperColor               AS paperColor       ON paperColor.id = s.paperColorId
         LEFT JOIN PaperPattern             AS paperPattern     ON paperPattern.id = s.paperPatternId
         LEFT JOIN PaperCert                AS paperCert        ON paperCert.id = s.paperCertId

            # 도착예정
         LEFT JOIN StockEvent               AS arrivalEvent     ON arrivalEvent.stockId = s.id AND arrivalEvent.status = ${StockEventStatus.PENDING}
         LEFT JOIN _StockEventOutPlan       AS arrivalEventPlan ON arrivalEventPlan.B = arrivalEvent.id
         LEFT JOIN Plan                     AS p                ON p.id = arrivalEventPlan.A
         LEFT JOIN OrderStock               AS os               ON os.planId = p.id
         LEFT JOIN _OrderStockToStockEvent  AS osToStockEvent   ON osToStockEvent.A = os.id
         LEFT JOIN StockEvent               AS osStockEvent     ON osStockEvent.id = osToStockEvent.B
         LEFT JOIN StockGroup               AS sg               ON sg.orderStockId = os.id
         LEFT JOIN Warehouse                AS sgWarehouse      ON sgWarehouse.id = sg.warehouseId
         LEFT JOIN \`Location\`             AS dstLocation      ON dstLocation.id = os.dstLocationId 

         LEFT JOIN \`Order\`                AS o                ON o.id = os.orderId
         LEFT JOIN Company                  AS partnerCompany   ON partnerCompany.id = (CASE WHEN o.srcCompanyId = ${companyId} THEN o.dstCompanyId ELSE o.srcCompanyId END)

            # OrderStock 메타데이터
         LEFT JOIN Product                  AS osProduct          ON osProduct.id = os.productId
         LEFT JOIN PaperDomain              AS osPaperDomain      ON osPaperDomain.id = osProduct.paperDomainId
         LEFT JOIN Manufacturer             AS osManufacturer     ON osManufacturer.id = osProduct.manufacturerId
         LEFT JOIN PaperGroup               AS osPaperGroup       ON osPaperGroup.id = osProduct.paperGroupId
         LEFT JOIN PaperType                AS osPaperType        ON osPaperType.id = osProduct.paperTypeId
         LEFT JOIN Packaging                AS osPackaging        ON osPackaging.id = os.packagingId
         LEFT JOIN PaperColorGroup          AS osPaperColorGroup  ON osPaperColorGroup.id = os.paperColorGroupId
         LEFT JOIN PaperColor               AS osPaperColor       ON osPaperColor.id = os.paperColorId
         LEFT JOIN PaperPattern             AS osPaperPattern     ON osPaperPattern.id = os.paperPatternId
         LEFT JOIN PaperCert                AS osPaperCert        ON osPaperCert.id = os.paperCertId

             WHERE s.companyId = ${companyId}
               AND se.status IN(${StockEventStatus.NORMAL}, ${StockEventStatus.PENDING})

             GROUP BY s.warehouseId
                    , s.productId
                    , s.packagingId
                    , s.grammage
                    , s.sizeX
                    , s.sizeY
                    , s.paperColorGroupId
                    , s.paperColorId
                    , s.paperPatternId
                    , s.paperCertId

                    # 최신버전
                    , o.id
                    , os.id
                    , partnerCompany.id
                    , sgWarehouse.id
                    , osStockEvent.change
                    , p.id
            HAVING totalQuantity != 0 OR availableQuantity != 0

             ${limit}
    `;

    const total = stockGroups.length === 0 ? 0 : Number(stockGroups[0].total);
    for (const stockGroup of stockGroups) {
      stockGroup.totalQuantity = Number(stockGroup.totalQuantity);
      stockGroup.availableQuantity = Number(stockGroup.availableQuantity);
      delete stockGroup.total;
    }

    return { stockGroups, total };
  }

  async getStock(companyId: number, stockId: number) {
    const stock = await this.prisma.stock.findFirst({
      include: {
        company: true,
        warehouse: {
          include: {
            company: true,
          },
        },
        product: {
          include: {
            paperDomain: true,
            paperGroup: true,
            manufacturer: true,
            paperType: true,
          },
        },
        packaging: true,
        paperColorGroup: true,
        paperColor: true,
        paperPattern: true,
        paperCert: true,
      },
      where: {
        id: stockId,
        companyId,
      }
    });
    if (!stock)
      throw new StockNotFoundException(StockError.STOCK001, [stockId]);
    return stock;
  }
}
