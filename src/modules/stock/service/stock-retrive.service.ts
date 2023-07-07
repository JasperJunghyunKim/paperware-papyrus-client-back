import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderType,
  PackagingType,
  PlanStatus,
  PlanType,
  Prisma,
  StockEventStatus,
} from '@prisma/client';
import { PrismaService } from 'src/core';
import { Selector } from 'src/common';
import { StockGroup } from 'src/@shared/models';
import { Model } from 'src/@shared';
import { STOCK, STOCK_EVENT } from 'src/common/selector';
import { StockGroupHistoryResponse } from 'src/@shared/api';

interface StockGroupFromDB {
  warehouseId: number;
  warehouseName: string;
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
  planId: number;
  planNo: string;
  planStatus: PlanStatus;
  planType: PlanType;
  palnCreatedAt: string;

  orderId: number;
  orderNo: string;
  orderType: OrderType;

  orderStockId: number;
  osDstLocationId: number;
  osDstLocationName: string;
  osDstLocationIsPublic: boolean;
  osDstLocationAddress: string;
  osWantedDate: string;

  orderProcessId: number;
  opDstLocationId: number;
  opDstLocationName: string;
  opDstLocationIsPublic: boolean;
  opDstLocationAddress: string;
  opDstWantedDate: string;
  opSrcLocationId: number;
  opSrcLocationName: string;
  opSrcLocationIsPublic: boolean;
  opSrcLocationAddress: string;
  opSrcWtantedDate: string;

  psLocationId: number;
  psLocationName: string;
  psLocationIsPublic: boolean;
  psLocationAddress: string;
  psWantedDate: string;

  // 원지정보
  asWarehouseId: number;
  asWarehouseName: string;
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
  partnerCompanyManagedById: number;

  totalQuantity: number;
  availableQuantity: number;
  totalArrivalQuantity: number;
  storingQuantity: number;
  nonStoringQuantity: number;

  total: bigint;
}

interface StockGroupDetailFromDB {
  warehouseId: number;
  warehouseName: string;
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

  totalQuantity: number;
  availableQuantity: number;
  totalArrivalQuantity: number;
  storingQuantity: number;
  nonStoringQuantity: number;
}

@Injectable()
export class StockRetriveService {
  constructor(private readonly prisma: PrismaService) {}

  async getStockGroupList(params: {
    companyId: number;
    skip: number;
    take: number;
    planId: 'any' | number;
    isDirectShippingIncluded: boolean;
    isZeroQuantityIncluded: boolean;
    initialPlanId: number | null;
    warehouseIds: number[];
    packagingIds: number[];
    paperTypeIds: number[];
    manufacturerIds: number[];
    minGrammage: number | null;
    maxGrammage: number | null;
    sizeX: number | null;
    sizeY: number | null;
  }): Promise<{
    items: StockGroup[];
    total: number;
  }> {
    const {
      companyId,
      skip,
      take,
      planId,
      isDirectShippingIncluded,
      isZeroQuantityIncluded,
      initialPlanId,
      warehouseIds,
      packagingIds,
      paperTypeIds,
      manufacturerIds,
      minGrammage,
      maxGrammage,
      sizeX,
      sizeY,
    } = params;

    /** Query Condition */
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
    const directShippingQuery = isDirectShippingIncluded
      ? Prisma.empty
      : Prisma.sql`AND (
          (initialOs.id IS NULL AND initialOp.id IS NULL AND initialPs.planId IS NULL) OR
          (initialOs.id IS NOT NULL AND initialOs.isDirectShipping = ${false}) OR
          (initialPs.planId IS NOT NULL AND initialPs.isDirectShipping = ${false}) OR
          (initialOp.id IS NOT NULL AND initialO.srcCompanyId = ${companyId} AND initialOp.isSrcDirectShipping = ${false}) OR
          (initialOp.id IS NOT NULL AND initialO.dstCompanyId = ${companyId} AND initialOp.isDstDirectShipping = ${false})
        )`;
    const zeroQuantityQuery = isZeroQuantityIncluded
      ? Prisma.empty
      : Prisma.sql`HAVING availableQuantity != 0 OR totalQuantity != 0`;

    const initialPlanQuery = initialPlanId
      ? Prisma.sql`AND s.initialPlanId = ${initialPlanId}`
      : Prisma.empty;

    const warehouseQuery =
      warehouseIds.length > 0
        ? Prisma.sql`AND s.warehouseId IN (${Prisma.join(warehouseIds)})`
        : Prisma.empty;

    const packagingQuery =
      packagingIds.length > 0
        ? Prisma.sql`AND s.packagingId IN (${Prisma.join(packagingIds)})`
        : Prisma.empty;

    const paperTypeQuery =
      paperTypeIds.length > 0
        ? Prisma.sql`AND product.paperTypeId IN (${Prisma.join(paperTypeIds)})`
        : Prisma.empty;

    const manufacturerQuery =
      manufacturerIds.length > 0
        ? Prisma.sql`AND product.manufacturerId IN (${Prisma.join(
            manufacturerIds,
          )})`
        : Prisma.empty;

    const minGrammageQuery = minGrammage
      ? Prisma.sql`AND s.grammage >= ${minGrammage}`
      : Prisma.empty;
    const maxGrammageQuery = maxGrammage
      ? Prisma.sql`AND s.grammage <= ${maxGrammage}`
      : Prisma.empty;

    const sizeXQuery = sizeX
      ? Prisma.sql`AND s.sizeX >= ${sizeX}`
      : Prisma.empty;
    const sizeYQuery = sizeY
      ? Prisma.sql`AND s.sizeY >= ${sizeY}`
      : Prisma.empty;

    const stockGroups: StockGroupFromDB[] = await this.prisma.$queryRaw`
      SELECT w.id AS warehouseId
            , w.name AS warehouseName
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
            , p.id AS planId
            , p.planNo AS planNo
            , p.status As planStatus
            , p.type As planType
            , p.createdAt As planCreatedAt
            , ps.wantedDate AS psWantedDate

            , os.id AS orderStockId
            , o.id AS orderId
            , o.orderNo AS orderNo
            , o.orderType AS orderType

            , osDstLocation.id AS osDstLocationId
            , osDstLocation.name AS osDstLocationName
            , osDstLocation.isPublic AS osDstLocationIsPublic
            , osDstLocation.address AS osDstLocationAddress
            , os.wantedDate AS osWantedDate

            , op.id AS orderProcessId
            , opDstLocation.id AS opDstLocationId
            , opDstLocation.name AS opDstLocationName
            , opDstLocation.isPublic AS opDstLocationIsPublic
            , opDstLocation.address AS opDstLocationAddress
            , op.dstWantedDate AS opDstWantedDate
            
            , opSrcLocation.id AS opSrcLocationId
            , opSrcLocation.name AS opSrcLocationName
            , opSrcLocation.isPublic AS opSrcLocationIsPublic
            , opSrcLocation.address AS opSrcLocationAddress
            , op.srcWantedDate AS opSrcWtantedDate

            , psLocation.id AS psLocationId
            , psLocation.name AS psLocationName
            , psLocation.isPublic AS psLocationIsPublic
            , psLocation.address AS psLocationAddress
            

            -- 거래처 정보
            , partnerCompany.id AS partnerCompanyId
            , partnerCompany.businessName As partnerCompanyBusinessName
            , partnerCompany.companyRegistrationNumber As partnerCompanyCompanyRegistrationNumber
            , partnerCompany.invoiceCode AS partnerCompanyInvoiceCode
            , partnerCompany.representative AS partnerCompanyRepresentative
            , partnerCompany.address AS partnerCompanyAddress
            , partnerCompany.phoneNo AS partnerCompanyPhoneNo
            , partnerCompany.faxNo As partnerCompanyFaxNo
            , partnerCompany.managedById AS partnerCompanyManagedById

            -- 원지정보
            , asw.id AS asWarehouseId
            , asw.name AS asWarehouseName
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
   LEFT JOIN PlanShipping       AS ps                       ON ps.planId = p.id
   LEFT JOIN Location           AS psLocation               ON psLocation.id = ps.dstLocationId

   -- initialPlan (직송, 외주공정재고 걸러내기)
   LEFT JOIN Plan               AS initialP                 ON initialP.id = s.initialPlanId
   LEFT JOIN OrderStock         AS initialOs                ON initialOs.id = initialP.orderStockId
   LEFT JOIN OrderProcess       AS initialOp                ON initialOp.id = initialP.orderProcessId
   LEFT JOIN PlanShipping       AS initialPs                ON initialPs.planId = initialP.id
   LEFT JOIN \`Order\`          AS initialO                 ON initialO.id = (CASE 
                                                                              WHEN initialOs.orderId IS NOT NULL THEN initialOs.orderId
                                                                              WHEN initialOp.orderId IS NOT NULL THEN initialOp.orderId
                                                                              ELSE 0
                                                                             END)

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
   LEFT JOIN \`Location\`       AS osDstLocation            ON osDstLocation.id = os.dstLocationId

   LEFT JOIN OrderProcess       AS op                       ON op.id = p.orderProcessId AND op.companyId = ${companyId}
   LEFT JOIN \`Location\`       AS opSrcLocation            ON opSrcLocation.id = op.srcLocationId
   LEFT JOIN \`Location\`       AS opDstLocation            ON opDstLocation.id = op.dstLocationId

   LEFT JOIN \`Order\`          AS o                        ON o.id = (CASE 
                                                                        WHEN os.orderId IS NOT NULL THEN os.orderId 
                                                                        WHEN op.orderId IS NOT NULL THEN op.orderId 
                                                                        ELSE 0
                                                                      END)
   LEFT JOIN Company            AS partnerCompany           ON partnerCompany.id =  IF(o.srcCompanyId = ${companyId}, o.dstCompanyId, o.srcCompanyId)

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
         AND (initialO.id IS NULL
                OR (initialO.id IS NOT NULL AND initialO.orderType != ${OrderType.OUTSOURCE_PROCESS})
                OR (initialO.id IS NOT NULL AND initialO.orderType = ${OrderType.OUTSOURCE_PROCESS} AND initialO.srcCompanyId = ${companyId})
                OR (initialO.id IS NOT NULL AND initialO.orderType = ${OrderType.OUTSOURCE_PROCESS} AND initialO.dstCompanyId = ${companyId} AND s.planId IS NOT NULL)
              ) 
         ${directShippingQuery}
         ${initialPlanQuery}
         ${warehouseQuery}
         ${packagingQuery}
         ${paperTypeQuery}
         ${manufacturerQuery}
         ${minGrammageQuery}
         ${maxGrammageQuery}
         ${sizeXQuery}
         ${sizeYQuery}

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
                , o.id
                , os.id
                , p.id
        ${zeroQuantityQuery}

      ${limit}
    `;
    const total = stockGroups.length === 0 ? 0 : Number(stockGroups[0].total);

    return {
      items: stockGroups.map((sg) => {
        return {
          warehouse: sg.warehouseId
            ? {
                id: sg.warehouseId,
                name: sg.warehouseName,
                address: sg.warehouseAddress,
                isPublic: sg.warehouseIsPublic,
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
          plan: sg.planId
            ? {
                id: sg.planId,
                planNo: sg.planNo,
                planType: sg.planType,
                orderStock: sg.orderStockId
                  ? {
                      wantedDate: sg.osWantedDate,
                      order: {
                        id: sg.orderId,
                        orderNo: sg.orderNo,
                        orderType: sg.orderType,
                        partnerCompany: {
                          id: sg.partnerCompanyId,
                          businessName: sg.partnerCompanyBusinessName,
                          companyRegistrationNumber:
                            sg.partnerCompanyCompanyRegistrationNumber,
                          invoiceCode: sg.partnerCompanyInvoiceCode,
                          representative: sg.partnerCompanyRepresentative,
                          address: sg.partnerCompanyAddress,
                          phoneNo: sg.partnerCompanyPhoneNo,
                          faxNo: sg.partnerCompanyFaxNo,
                          managedById: sg.partnerCompanyManagedById,
                        },
                      },
                      dstLocation: {
                        id: sg.osDstLocationId,
                        name: sg.osDstLocationName,
                        isPublic: sg.osDstLocationIsPublic,
                        address: sg.osDstLocationAddress,
                      },
                    }
                  : null,
                orderProcess: sg.orderProcessId
                  ? {
                      srcWantedDate: sg.opSrcWtantedDate,
                      dstWantedDate: sg.opDstWantedDate,
                      srcLocation: {
                        id: sg.opSrcLocationId,
                        name: sg.opSrcLocationName,
                        isPublic: sg.opSrcLocationIsPublic,
                        address: sg.opSrcLocationAddress,
                      },
                      dstLocation: {
                        id: sg.opDstLocationId,
                        name: sg.opDstLocationName,
                        isPublic: sg.opDstLocationIsPublic,
                        address: sg.opDstLocationAddress,
                      },
                      order: {
                        id: sg.orderId,
                        orderNo: sg.orderNo,
                        orderType: sg.orderType,
                        partnerCompany: {
                          id: sg.partnerCompanyId,
                          businessName: sg.partnerCompanyBusinessName,
                          companyRegistrationNumber:
                            sg.partnerCompanyCompanyRegistrationNumber,
                          invoiceCode: sg.partnerCompanyInvoiceCode,
                          representative: sg.partnerCompanyRepresentative,
                          address: sg.partnerCompanyAddress,
                          phoneNo: sg.partnerCompanyPhoneNo,
                          faxNo: sg.partnerCompanyFaxNo,
                          managedById: sg.partnerCompanyManagedById,
                        },
                      },
                    }
                  : null,
                planShipping: sg.psWantedDate
                  ? {
                      wantedDate: sg.psWantedDate,
                      dstLocation: {
                        id: sg.psLocationId,
                        name: sg.psLocationName,
                        isPublic: sg.psLocationIsPublic,
                        address: sg.psLocationAddress,
                      },
                    }
                  : null,
              }
            : null,
          totalQuantity: Number(sg.totalQuantity),
          availableQuantity: Number(sg.availableQuantity),
          totalArrivalQuantity: Number(sg.totalArrivalQuantity),
          storingQuantity: Number(sg.storingQuantity),
          nonStoringQuantity: Number(sg.nonStoringQuantity),
          lossRate: null, // TODO: 계산
        };
      }),
      total,
    };
  }

  async getStockGroupHistories(params: {
    skip: number;
    take: number;
    companyId: number;
    warehouseId: number | null;
    productId: number;
    packagingId: number;
    grammage: number;
    sizeX: number;
    sizeY: number | null;
    paperColorGroupId: number | null;
    paperColorId: number | null;
    paperPatternId: number | null;
    paperCertId: number | null;
  }) {
    const stocks = await this.getStockList({
      companyId: params.companyId,
      warehouseId: params.warehouseId,
      productId: params.productId,
      packagingId: params.packagingId,
      grammage: params.grammage,
      sizeX: params.sizeX,
      sizeY: params.sizeY,
      paperColorGroupId: params.paperColorGroupId,
      paperColorId: params.paperColorId,
      paperPatternId: params.paperPatternId,
      paperCertId: params.paperCertId,
      planId: null,
    });

    const stockInfo = await this.prisma.stock.findFirst({
      select: STOCK,
      where: {
        companyId: params.companyId,
        warehouseId: params.warehouseId,
        productId: params.productId,
        packagingId: params.packagingId,
        grammage: params.grammage,
        sizeX: params.sizeX,
        sizeY: params.sizeY,
        paperColorGroupId: params.paperColorGroupId,
        paperColorId: params.paperColorId,
        paperPatternId: params.paperPatternId,
        paperCertId: params.paperCertId,
        planId: null,
      },
    });

    const [stockGroupHistories, total, prevSum] =
      await this.prisma.$transaction([
        this.prisma.stockEvent.findMany({
          select: STOCK_EVENT,
          where: {
            stock: {
              companyId: params.companyId,
              warehouseId: params.warehouseId,
              productId: params.productId,
              packagingId: params.packagingId,
              grammage: params.grammage,
              sizeX: params.sizeX,
              sizeY: params.sizeY,
              paperColorGroupId: params.paperColorGroupId,
              paperColorId: params.paperColorId,
              paperPatternId: params.paperPatternId,
              paperCertId: params.paperCertId,
              planId: null,
            },
            status: 'NORMAL',
          },
          skip: params.skip,
          take: params.take,
          orderBy: {
            id: 'desc',
          },
        }),
        this.prisma.stockEvent.count({
          where: {
            stock: {
              companyId: params.companyId,
              warehouseId: params.warehouseId,
              productId: params.productId,
              packagingId: params.packagingId,
              grammage: params.grammage,
              sizeX: params.sizeX,
              sizeY: params.sizeY,
              paperColorGroupId: params.paperColorGroupId,
              paperColorId: params.paperColorId,
              paperPatternId: params.paperPatternId,
              paperCertId: params.paperCertId,
              planId: null,
            },
            status: 'NORMAL',
          },
        }),
        this.prisma.stockEvent.aggregate({
          _sum: {
            change: true,
          },
          orderBy: {
            id: 'desc',
          },
          skip: params.skip + params.take,
          where: {
            stock: {
              companyId: params.companyId,
              warehouseId: params.warehouseId,
              productId: params.productId,
              packagingId: params.packagingId,
              grammage: params.grammage,
              sizeX: params.sizeX,
              sizeY: params.sizeY,
              paperColorGroupId: params.paperColorGroupId,
              paperColorId: params.paperColorId,
              paperPatternId: params.paperPatternId,
              paperCertId: params.paperCertId,
              planId: null,
            },
            status: 'NORMAL',
          },
        }),
      ]);

    let prevTotalQuantity = prevSum._sum.change || 0;
    for (let i = stockGroupHistories.length - 1; i >= 0; i--) {
      prevTotalQuantity += stockGroupHistories[i].change;
      stockGroupHistories[i]['remainingQuantity'] = prevTotalQuantity;
    }

    return {
      stockInfo,
      stocks,
      stockEvents: {
        items: stockGroupHistories.map((e) => ({
          ...e,
          remainingQuantity: e['remainingQuantity'],
        })),
        total,
      },
    };
  }

  async getStockGroup(params: {
    warehouseId: number | null;
    planId: number | null;
    productId: number;
    packagingId: number;
    grammage: number;
    sizeX: number;
    sizeY: number;
    paperColorGroupId: number | null;
    paperColorId: number | null;
    paperPatternId: number | null;
    paperCertId: number | null;
  }): Promise<Model.StockGroup> {
    const warehouseCondition = params.warehouseId
      ? Prisma.sql`s.warehouseId = ${params.warehouseId}`
      : Prisma.sql`s.warehouseId IS NULL`;
    const planCondition = params.planId
      ? Prisma.sql`s.planId = ${params.planId}`
      : Prisma.sql`s.planId IS NULL`;
    const paperColorGroupCondition = params.paperColorGroupId
      ? Prisma.sql`s.paperColorGroupId = ${params.paperColorGroupId}`
      : Prisma.sql`s.paperColorGroupId IS NULL`;
    const paperColorCondition = params.paperColorId
      ? Prisma.sql`s.paperColorId = ${params.paperColorId}`
      : Prisma.sql`s.paperColorId IS NULL`;
    const paperPatternCondition = params.paperPatternId
      ? Prisma.sql`s.paperPatternId = ${params.paperPatternId}`
      : Prisma.sql`s.paperPatternId IS NULL`;
    const paperCertCondition = params.paperCertId
      ? Prisma.sql`s.paperCertId = ${params.paperCertId}`
      : Prisma.sql`s.paperCertId IS NULL`;

    const stockGroups: StockGroupDetailFromDB[] = await this.prisma.$queryRaw`
      SELECT w.id AS warehouseId
            , w.name AS warehouseName
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

            -- 수량
            , IFNULL(SUM(s.cachedQuantityAvailable), 0) AS availableQuantity
            , IFNULL(SUM(s.cachedQuantity), 0) AS totalQuantity

            -- 도착예정재고 수량
            , IFNULL(SUM(arrivalStockEvent.totalArrivalQuantity), 0) AS totalArrivalQuantity
            , IFNULL(SUM(arrivalStockEvent.storingQuantity), 0) AS storingQuantity
            , ABS(IFNULL(SUM(arrivalStockEvent.nonStoringQuantity), 0)) AS nonStoringQuantity

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

       WHERE ${warehouseCondition}
         AND ${planCondition}
         AND ${paperColorGroupCondition}
         AND ${paperColorCondition}
         AND ${paperPatternCondition}
         AND ${paperCertCondition}
         AND s.productId = ${params.productId}
         AND s.packagingId = ${params.packagingId}
         AND s.grammage = ${params.grammage}
         AND s.sizeX = ${params.sizeX}
         AND s.sizeY = ${params.sizeY}

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
    `;

    if (stockGroups.length === 0)
      throw new NotFoundException(`존재하지 않는 재고그룹입니다.`);
    const stockGroup = stockGroups[0];

    return {
      warehouse: stockGroup.warehouseId
        ? {
            id: stockGroup.warehouseId,
            name: stockGroup.warehouseName,
            isPublic: stockGroup.warehouseIsPublic,
            address: stockGroup.warehouseAddress,
          }
        : null,
      product: {
        id: stockGroup.productId,
        paperDomain: {
          id: stockGroup.paperDomainId,
          name: stockGroup.paperDomainName,
        },
        paperGroup: {
          id: stockGroup.paperGroupId,
          name: stockGroup.paperGroupName,
        },
        manufacturer: {
          id: stockGroup.manufacturerId,
          name: stockGroup.manufacturerName,
        },
        paperType: {
          id: stockGroup.paperTypeId,
          name: stockGroup.paperTypeName,
        },
      },
      packaging: {
        id: stockGroup.packagingId,
        type: stockGroup.packagingType,
        packA: stockGroup.packagingPackA,
        packB: stockGroup.packagingPackB,
      },
      grammage: stockGroup.grammage,
      sizeX: stockGroup.sizeX,
      sizeY: stockGroup.sizeY,
      paperColorGroup: stockGroup.paperColorGroupId
        ? {
            id: stockGroup.paperColorGroupId,
            name: stockGroup.paperColorGroupName,
          }
        : null,
      paperColor: stockGroup.paperColorId
        ? {
            id: stockGroup.paperColorId,
            name: stockGroup.paperColorName,
          }
        : null,
      paperPattern: stockGroup.paperPatternId
        ? {
            id: stockGroup.paperPatternId,
            name: stockGroup.paperPatternName,
          }
        : null,
      paperCert: stockGroup.paperCertId
        ? {
            id: stockGroup.paperCertId,
            name: stockGroup.paperCertName,
          }
        : null,
      plan: null, // TODO... 필요하면 추가
      totalQuantity: Number(stockGroup.totalQuantity),
      availableQuantity: Number(stockGroup.availableQuantity),
      totalArrivalQuantity: Number(stockGroup.totalArrivalQuantity),
      storingQuantity: Number(stockGroup.storingQuantity),
      nonStoringQuantity: Number(stockGroup.nonStoringQuantity),
      lossRate: null,
    };
  }

  async getStockList(data: Prisma.StockWhereInput) {
    const paperColorGroupId = data.paperColorGroupId
      ? Prisma.sql`s.paperColorGroupId = ${data.paperColorGroupId}`
      : Prisma.sql`s.paperColorGroupId IS NULL`;
    const paperColorId = data.paperColorId
      ? Prisma.sql`s.paperColorId = ${data.paperColorId}`
      : Prisma.sql`s.paperColorId IS NULL`;
    const paperPatternId = data.paperPatternId
      ? Prisma.sql`s.paperPatternId = ${data.paperPatternId}`
      : Prisma.sql`s.paperPatternId IS NULL`;
    const paperCertId = data.paperCertId
      ? Prisma.sql`s.paperCertId = ${data.paperCertId}`
      : Prisma.sql`s.paperCertId IS NULL`;
    const planId = data.planId
      ? Prisma.sql`s.planId = ${data.planId}`
      : Prisma.sql`s.planId IS NULL`;

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
          in: stockIds.map((id) => id.id),
        },
      },
    });

    for (const stock of stocks) {
      if (stock.initialPlan.orderStock) {
        stock.initialPlan.orderStock.order.tradePrice =
          stock.initialPlan.orderStock.order.tradePrice.filter(
            (tp) => tp.companyId === data.companyId,
          );
      } else if (stock.initialPlan.orderProcess) {
        stock.initialPlan.orderProcess.order.tradePrice =
          stock.initialPlan.orderProcess.order.tradePrice.filter(
            (tp) => tp.companyId === data.companyId,
          );
      }
    }

    return stocks;
  }

  async getStockGroupQuantity(params: {
    warehouseId: number | null;
    planId: number | null;
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
          planId: params.planId,
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
        stock: true,
        change: true,
        status: true,
      },
    });

    // 일반재고
    const availableQuantity = quantity
      .filter((e) => e.stock.planId === null && e.status !== 'CANCELLED')
      .reduce((acc, cur) => {
        return acc + cur.change;
      }, 0);
    const totalQuantity = quantity
      .filter((e) => e.stock.planId === null && e.status === 'NORMAL')
      .reduce((acc, cur) => {
        return acc + cur.change;
      }, 0);

    // 도착예정재고
    const totalArrivalQuantity = quantity
      .filter(
        (e) =>
          e.stock.planId !== null && e.status === 'PENDING' && e.change > 0,
      )
      .reduce((acc, cur) => {
        return acc + cur.change;
      }, 0);
    const nonStoringQuantity = -quantity
      .filter(
        (e) =>
          e.stock.planId !== null && e.status === 'PENDING' && e.change < 0,
      )
      .reduce((acc, cur) => {
        return acc + cur.change;
      }, 0);
    const storingQuantity = totalArrivalQuantity - nonStoringQuantity;

    return {
      availableQuantity,
      totalQuantity,
      totalArrivalQuantity,
      nonStoringQuantity,
      storingQuantity,
    };
  }

  async getStock(companyId: number, stockId: number) {
    const stock = await this.prisma.stock.findFirst({
      select: STOCK,
      where: {
        id: stockId,
        companyId,
      },
    });
    if (!stock) throw new NotFoundException(`존재하지 않는 재고입니다.`);

    return stock;
  }

  async getStockBySerial(companyId: number, serial: string) {
    const company = await this.prisma.company.findUnique({
      where: {
        id: companyId,
      },
      select: {
        invoiceCode: true,
      },
    });

    const stock = await this.prisma.stock.findUnique({
      where: {
        serial: `P${company.invoiceCode}${serial}`,
      },
      select: STOCK,
    });

    if (!stock || stock.company.id !== companyId)
      throw new NotFoundException(`존재하지 않는 재고입니다.`);

    return stock;
  }
}
