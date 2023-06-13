import { Injectable } from '@nestjs/common';
import {
  PackagingType,
  PlanStatus,
  PlanType,
  Prisma,
  StockEventStatus,
} from '@prisma/client';
import { PrismaService } from 'src/core';
import { Selector } from 'src/common';
import { StockGroup } from 'src/@shared/models';

interface StockGroupFromDB {
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
  orderNo: string;
  dstLocationId: number;
  dstLocationName: string;
  dstLocationCode: string;
  dstLocationIsPublic: boolean;
  dstLocationAddress: string;
  wantedDate: string;

  planId: number;
  planNo: string;
  planStatus: PlanStatus;
  planType: PlanType;
  palnCreatedAt: string;

  // 원지정보
  asWarehouseId: number;
  asWarehouseName: string;
  asWarehouseCode: string;
  asWarehouseIsPublic: boolean;
  asWarehouseAddress: string;

  asProductId: number;
  asPaperDomainId: number;
  asPaperDomainName: string;
  asManufacturerId: number;
  asManufacturerName: string;
  asPaperGroupId: number;
  asPaperGroupName: string;
  asPaperTypeId: number;
  asPaperTypeName: string;
  asPackagingId: number;
  asPackagingName: string;
  asPackagingType: PackagingType;
  asPackagingPackA: number;
  asPackagingPackB: number;
  asPaperColorGroupId: number;
  asPaperColorGroupName: string;
  asPaperColorId: number;
  asPaperColorName: string;
  asPaperPatternId: number;
  asPaperPatternName: string;
  asPaperCertId: number;
  asPaperCertName: string;
  asGrammage: number;
  asSizeX: number;
  asSizeY: number;
  asQuantity: number;

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
  totalArrivalQuantity: number;
  storingQuantity: number;
  nonStoringQuantity: number;

  total: bigint;
}

@Injectable()
export class StockRetriveService {
  constructor(private readonly prisma: PrismaService) { }

  async getStockGroupList(companyId: number, skip: number, take: number, planId: 'any' | number): Promise<{
    items: StockGroup[];
    total: number;
  }> {
    const limit = take ? Prisma.sql`LIMIT ${skip}, ${take}` : Prisma.empty;
    let planIdQuery = Prisma.empty;
    if (planId) {
      switch (planId) {
        case 'any':
          planIdQuery = Prisma.sql`AND s.planId IS NOT NULL`;
          break;
        default:
          planIdQuery = Prisma.sql`AND s.planId = ${Number(planId)}`;
          break;
      }
    }

    const stockGroups: StockGroupFromDB[] = await this.prisma.$queryRaw`
      SELECT w.id AS warehouseId
            , w.name AS warehouseName
            , w.code AS warehouseCode
            , w.isPublic AS warehouseIsPublic
            , w.address AS warehouseAddress

            -- 메타데이터
            , packaging.id AS packagingId
            , packaging.name AS packagingName
            , packaging.type AS packagingType
            , packaging.packA AS packagingPackA
            , packaging.packB AS packagingPackB
            , product.id AS productId
            , paperDomain.id AS paperDomainId
            , paperDomain.name AS paperDomainName
            , manufacturer.id AS manufacturerId
            , manufacturer.name AS manufacturerName
            , paperGroup.id AS paperGroupId
            , paperGroup.name AS paperGroupName
            , paperType.id AS paperTypeId
            , paperType.name AS paperTypeName
            , s.grammage AS grammage
            , s.sizeX AS sizeX
            , s.sizeY AS sizeY
            , paperColorGroup.id AS paperColorGroupId
            , paperColorGroup.name AS paperColorGroupName
            , paperColor.id AS paperColorId
            , paperColor.name AS paperColorName
            , paperPattern.id AS paperPatternId
            , paperPattern.name AS paperPatternName
            , paperCert.id AS paperCertId
            , paperCert.name AS paperCertName

            -- 도착예정 정보
            , os.id AS orderStockId
            , o.id AS orderId
            , o.orderNo AS orderNo
            , dstLocation.id AS dstLocationId
            , dstLocation.name AS dstLocationName
            , dstLocation.code AS dstLocationCode
            , dstLocation.isPublic AS dstLocationIsPublic
            , dstLocation.address AS dstLocationAddress
            , os.wantedDate AS wantedDate
            , p.id AS planId
            , p.planNo As planNo
            , p.status As planStatus
            , p.type As planType
            , p.createdAt As planCreatedAt

            -- 거래처 정보
            , partnerCompany.id AS partnerCompanyId
            , partnerCompany.businessName As partnerCompanyBusinessName
            , partnerCompany.companyRegistrationNumber As partnerCompanyCompanyRegistrationNumber
            , partnerCompany.invoiceCode AS partnerCompanyInvoiceCode
            , partnerCompany.representative AS partnerCompanyRepresentative
            , partnerCompany.address AS partnerCompanyAddress
            , partnerCompany.phoneNo AS partnerCompanyPhoneNo
            , partnerCompany.faxNo As partnerCompanyFaxNo
            , partnerCompany.email AS partnerCompanyEmail
            , partnerCompany.managedById AS partnerCompanyManagedById

            -- 원지정보
            , asw.id AS asWarehouseId
            , asw.name AS asWarehouseName
            , asw.code AS asWarehouseCode
            , asw.isPublic AS asWarehouseIsPublic
            , asw.address AS asWarehouseAddress

            , asProduct.id AS asProductId
            , asPaperDomain.id AS asPaperDomainId
            , asPaperDomain.name AS asPaperDomainName
            , asManufacturer.id AS asManufacturerId
            , asManufacturer.name AS asManufacturerName
            , asPaperGroup.id AS asPaperGroupId
            , asPaperGroup.name AS asPaperGroupName
            , asPaperType.id AS asPaperTypeId
            , asPaperType.name AS asPaperTypeName
            , asPackaging.id AS asPackagingId
            , asPackaging.name AS asPackagingName
            , asPackaging.type AS asPackagingType
            , asPackaging.packA AS asPackagingPackA
            , asPackaging.packB AS asPackagingPackB
            , asPaperColorGroup.id AS asPaperColorGroupId
            , asPaperColorGroup.name AS asPaperColorGroupName
            , asPaperColor.id AS asPaperColorId
            , asPaperColor.name AS asPaperColorName
            , asPaperPattern.id AS asPaperPatternId
            , asPaperPattern.name AS asPaperPatternName
            , asPaperCert.id AS asPaperCertId
            , asPaperCert.name AS asPaperCertName
            , \`as\`.grammage AS asGrammage
            , \`as\`.sizeX AS asSizeX
            , \`as\`.sizeY AS asSizeY
            , ase.change AS asQuantity

            -- 수량
            , IFNULL(SUM(s.cachedQuantityAvailable), 0) AS availableQuantity
            , IFNULL(SUM(s.cachedQuantity), 0) AS totalQuantity

            -- 도착예정재고 수량
            , IFNULL(SUM(arrivalStockEvent.totalArrivalQuantity), 0) AS totalArrivalQuantity
            , IFNULL(SUM(arrivalStockEvent.storingQuantity), 0) AS storingQuantity
            , ABS(IFNULL(SUM(arrivalStockEvent.nonStoringQuantity), 0)) AS nonStoringQuantity

            -- total
            , COUNT(1) OVER() AS total

        FROM Stock              AS s
   LEFT JOIN (
          SELECT stockId
                , IFNULL(SUM(\`change\`), 0) AS storingQuantity
                , IFNULL(SUM(CASE WHEN \`change\` < 0 THEN \`change\` END), 0) AS nonStoringQuantity
                , IFNULL(SUM(CASE WHEN \`change\` > 0 THEN \`change\` END), 0) AS totalArrivalQuantity
            FROM StockEvent
           WHERE status = ${StockEventStatus.PENDING}

           GROUP BY stockId
        ) AS arrivalStockEvent ON arrivalStockEvent.stockId = s.id
   LEFT JOIN Warehouse          AS w                        ON w.id = s.warehouseId
   LEFT JOIN Plan               AS p                        ON p.id = s.planId

   -- 원지 정보
   LEFT JOIN StockEvent         AS ase                      ON ase.id = p.assignStockEventId
   LEFT JOIN Stock              AS \`as\`                   ON \`as\`.id = ase.stockId
   LEFT JOIN Warehouse          AS asw                      ON asw.id = \`as\`.warehouseId

   -- 원지 메타데이터
   LEFT JOIN Packaging          AS asPackaging              ON asPackaging.id = \`as\`.packagingId
   LEFT JOIN Product            AS asProduct                ON asProduct.id = \`as\`.productId
   LEFT JOIN PaperDomain        AS asPaperDomain            ON asPaperDomain.id = asProduct.paperDomainId
   LEFT JOIN Manufacturer       AS asManufacturer           ON asManufacturer.id = asProduct.manufacturerId
   LEFT JOIN PaperGroup         AS asPaperGroup             ON asPaperGroup.id = asProduct.paperGroupId
   LEFT JOIN PaperType          AS asPaperType              ON asPaperType.id = asProduct.paperTypeId
   LEFT JOIN PaperColorGroup    AS asPaperColorGroup        ON asPaperColorGroup.id = \`as\`.paperColorGroupId
   LEFT JOIN PaperColor         AS asPaperColor             ON asPaperColor.id = \`as\`.paperColorId
   LEFT JOIN PaperPattern       AS asPaperPattern           ON asPaperPattern.id = \`as\`.paperPatternId
   LEFT JOIN PaperCert          AS asPaperCert              ON asPaperCert.id = \`as\`.paperCertId

   -- 거래 정보
   LEFT JOIN OrderStock         AS os                       ON os.id = p.orderStockId
   LEFT JOIN \`Order\`          AS o                        ON o.id = os.orderId
   LEFT JOIN Company            AS partnerCompany           ON partnerCompany.id =  IF(o.srcCompanyId = ${companyId}, o.dstCompanyId, o.srcCompanyId)
   LEFT JOIN \`Location\`       AS dstLocation              ON dstLocation.id = os.dstLocationId

      -- 메타데이터
        JOIN Packaging          AS packaging                ON packaging.id = s.packagingId
        JOIN Product            AS product                  ON product.id = s.productId
        JOIN PaperDomain        AS paperDomain              ON paperDomain.id = product.paperDomainId
        JOIN Manufacturer       AS manufacturer             ON manufacturer.id = product.manufacturerId
        JOIN PaperGroup         AS paperGroup               ON paperGroup.id = product.paperGroupId
        JOIN PaperType          AS paperType                ON paperType.id = product.paperTypeId
   LEFT JOIN PaperColorGroup    AS paperColorGroup          ON paperColorGroup.id = s.paperColorGroupId
   LEFT JOIN PaperColor         AS paperColor               ON paperColor.id = s.paperColorId
   LEFT JOIN PaperPattern       AS paperPattern             ON paperPattern.id = s.paperPatternId
   LEFT JOIN PaperCert          AS paperCert                ON paperCert.id = s.paperCertId

       WHERE s.companyId = ${companyId}
         ${planIdQuery}

       GROUP BY s.packagingId
                , s.productId
                , s.grammage
                , s.sizeX
                , s.sizeY
                , s.paperColorGroupId
                , s.paperColorId
                , s.paperPatternId
                , s.paperCertId
                , s.warehouseId
                , s.planId

                -- mysql error
                , partnerCompany.id


      ${limit}
    `;
    const total = stockGroups.length === 0 ? 0 : Number(stockGroups[0].total);

    return {
      items: stockGroups.map(sg => {
        return {
          warehouse: sg.warehouseId ? {
            id: sg.warehouseId,
            name: sg.warehouseName,
            address: sg.warehouseAddress,
            code: sg.warehouseCode,
            isPublic: sg.warehouseIsPublic,
          } : null,
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
          paperColorGroup: sg.paperColorGroupId ? {
            id: sg.paperColorGroupId,
            name: sg.paperColorGroupName,
          } : null,
          paperColor: sg.paperColorId ? {
            id: sg.paperColorId,
            name: sg.paperColorName,
          } : null,
          paperPattern: sg.paperPatternId ? {
            id: sg.paperPatternId,
            name: sg.paperPatternName,
          } : null,
          paperCert: sg.paperCertId ? {
            id: sg.paperCertId,
            name: sg.paperCertName,
          } : null,
          plan: sg.planId ? {
            id: sg.planId,
            planNo: sg.planNo,
            orderStock: sg.orderStockId ? {
              order: {
                id: sg.orderId,
                orderNo: sg.orderNo,
                wantedDate: sg.wantedDate,
                partnerCompany: {
                  id: sg.partnerCompanyId,
                  businessName: sg.partnerCompanyBusinessName,
                  companyRegistrationNumber: sg.partnerCompanyCompanyRegistrationNumber,
                  invoiceCode: sg.partnerCompanyInvoiceCode,
                  representative: sg.partnerCompanyRepresentative,
                  address: sg.partnerCompanyAddress,
                  phoneNo: sg.partnerCompanyPhoneNo,
                  faxNo: sg.partnerCompanyFaxNo,
                  email: sg.partnerCompanyEmail,
                  managedById: sg.partnerCompanyManagedById,
                }
              },
              dstLocation: {
                id: sg.dstLocationId,
                name: sg.dstLocationName,
                code: sg.dstLocationCode,
                isPublic: sg.dstLocationIsPublic,
                address: sg.dstLocationAddress,
              }
            } : null,
          } : null,
          totalQuantity: Number(sg.totalQuantity),
          availableQuantity: Number(sg.availableQuantity),
          totalArrivalQuantity: Number(sg.totalArrivalQuantity),
          storingQuantity: Number(sg.storingQuantity),
          nonStoringQuantity: Number(sg.nonStoringQuantity),
        }
      }),
      total,
    }
  }

  async getStockList(data: Prisma.StockWhereInput) {
    const paperColorGroupId = data.paperColorGroupId ? Prisma.sql`s.paperColorGroupId = ${data.paperColorGroupId}` : Prisma.sql`s.paperColorGroupId IS NULL`;
    const paperColorId = data.paperColorId ? Prisma.sql`s.paperColorId = ${data.paperColorId}` : Prisma.sql`s.paperColorId IS NULL`;
    const paperPatternId = data.paperPatternId ? Prisma.sql`s.paperPatternId = ${data.paperPatternId}` : Prisma.sql`s.paperPatternId IS NULL`;
    const paperCertId = data.paperCertId ? Prisma.sql`s.paperCertId = ${data.paperCertId}` : Prisma.sql`s.paperCertId IS NULL`;
    const planId = data.planId ? Prisma.sql`s.planId = ${data.planId}` : Prisma.sql`s.planId IS NULL`;

    const stockIds: { id: number }[] = await this.prisma.$queryRaw`
      SELECT s.id
        FROM Stock      AS s
        JOIN (
          SELECT *, ROW_NUMBER() OVER(PARTITION BY stockId ORDER BY id ASC) AS rownum
            FROM StockEvent
           WHERE \`change\` > 0 AND \`status\` = ${StockEventStatus.NORMAL}
        ) AS outputSe ON outputSe.stockId = s.id

       WHERE s.companyId = ${data.companyId}
         AND s.warehouseId = ${data.warehouseId}
         AND s.productId = ${data.productId}
         AND s.packagingId = ${data.packagingId}
         AND s.grammage = ${data.grammage}
         AND s.sizeX = ${data.sizeX}
         AND s.sizeY = ${data.sizeY}
         AND ${paperColorGroupId}
         AND ${paperColorId}
         AND ${paperPatternId}
         AND ${paperCertId}
         AND ${planId}
         AND s.isDeleted = ${false}
         AND (s.cachedQuantity != 0 OR cachedQuantityAvailable != 0)
    `;

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
        initialPlan: {
          select: Selector.INITIAL_PLAN,
        },
        stockEvent: true,
      },
      where: {
        id: {
          in: stockIds.map(id => id.id),
        }
      },
    });

    return stocks;
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
          // initialOrderId: params.initialOrderId,
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

  }
}
