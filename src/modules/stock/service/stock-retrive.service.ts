import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderType,
  Packaging,
  PackagingType,
  PlanStatus,
  PlanType,
  Prisma,
  Stock,
  StockEventStatus,
  StockPrice,
} from '@prisma/client';
import { PrismaService } from 'src/core';
import { Selector } from 'src/common';
import { StockGroup } from 'src/@shared/models';
import { Model } from 'src/@shared';
import { STOCK, STOCK_EVENT, STOCK_PRICE } from 'src/common/selector';
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
  osDstLocationPhoneNo: string | null;
  osWantedDate: string;

  orderProcessId: number;
  opDstLocationId: number;
  opDstLocationName: string;
  opDstLocationIsPublic: boolean;
  opDstLocationAddress: string;
  opDstLocationPhoneNo: string | null;
  opDstWantedDate: string;
  opSrcLocationId: number;
  opSrcLocationName: string;
  opSrcLocationIsPublic: boolean;
  opSrcLocationAddress: string;
  opSrcLocationPhoneNo: string | null;
  opSrcWtantedDate: string;

  psLocationId: number;
  psLocationName: string;
  psLocationIsPublic: boolean;
  psLocationAddress: string;
  psLocationPhoneNo: string | null;
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
  partnerCompanyRegistrationNumber: string;
  partnerCompanyInvoiceCode: string;
  partnerCompanyBizType: string;
  partnerCompanyBizItem: string;
  partnerCompanyRepresentative: string;
  partnerCompanyAddress: string;
  partnerCompanyPhoneNo: string;
  partnerCompanyFaxNo: string;
  partnerCompanyManagedById: number;

  // 구매회사
  srcCompanyId: number;
  srcCompanyBusinessName: string;
  srcCompanyRegistrationNumber: string;
  srcCompanyInvoiceCode: string;
  srcCompanyBizType: string;
  srcCompanyBizItem: string;
  srcCompanyRepresentative: string;
  srcCompanyAddress: string;
  srcCompanyPhoneNo: string;
  srcCompanyFaxNo: string;
  srcCompanyManagedById: number;

  // 판매회사
  dstCompanyId: number;
  dstCompanyBusinessName: string;
  dstCompanyRegistrationNumber: string;
  dstCompanyInvoiceCode: string;
  dstCompanyBizType: string;
  dstCompanyBizItem: string;
  dstCompanyRepresentative: string;
  dstCompanyAddress: string;
  dstCompanyPhoneNo: string;
  dstCompanyFaxNo: string;
  dstCompanyManagedById: number;

  totalQuantity: number;
  availableQuantity: number;
  totalArrivalQuantity: number;
  storingQuantity: number;
  nonStoringQuantity: number;

  lossRate: number | null;

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

export interface PlanStockGroupFromDB {
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
  osDstLocationPhoneNo: string;
  osWantedDate: string;
  osIsDirectShipping: number;

  orderProcessId: number;
  opDstLocationId: number;
  opDstLocationName: string;
  opDstLocationIsPublic: boolean;
  opDstLocationAddress: string;
  opDstLocationPhoneNo: string;
  opDstWantedDate: string;
  opSrcLocationId: number;
  opSrcLocationName: string;
  opSrcLocationIsPublic: boolean;
  opSrcLocationAddress: string;
  opSrcLocationPhoneNo: string;
  opSrcWtantedDate: string;
  opIsSrcDirectShipping: number;
  opIsDstDirectShipping: number;

  psLocationId: number;
  psLocationName: string;
  psLocationIsPublic: boolean;
  psLocationAddress: string;
  psLocationPhoneNo: string;
  psWantedDate: string;
  psIsDirectShipping: number;

  // 거래처 정보
  partnerCompanyId: number;
  partnerCompanyBusinessName: string;
  partnerCompanyCompanyRegistrationNumber: string;
  partnerCompanyInvoiceCode: string;
  partnerCompanyBizType: string;
  partnerCompanyBizItem: string;
  partnerCompanyRepresentative: string;
  partnerCompanyAddress: string;
  partnerCompanyPhoneNo: string;
  partnerCompanyFaxNo: string;
  partnerCompanyManagedById: number;

  // 배정정보
  isAssigned: number;

  // 수량정보
  quantity: number;
}

@Injectable()
export class StockRetriveService {
  constructor(private readonly prisma: PrismaService) {}

  private ReamToSheetQuantity(quantity: number): number {
    return quantity * 500;
  }

  private SheetToReamQuantity(quantity: number): number {
    return quantity / 500;
  }

  private SheetToTonQuantity(
    quantity: number,
    grammage: number,
    sizeX: number,
    sizeY: number,
  ) {
    return quantity * grammage * sizeX * sizeY * 0.000001;
  }

  getStockSuppliedPrice(
    stock: Stock & { packaging: Packaging },
    quantity: number,
    stockPrice: StockPrice,
  ): number {
    switch (stockPrice.unitPriceUnit) {
      case 'WON_PER_BOX':
        // 수량을 BOX로
        if (stock.packaging.type !== 'BOX') return null;
        break;
      case 'WON_PER_REAM':
        // 수량을 REAM으로
        if (stock.packaging.type === 'ROLL') return null;
        if (
          stock.packaging.type === 'SKID' ||
          stock.packaging.type === 'REAM'
        ) {
          quantity = this.SheetToReamQuantity(quantity);
        } else if (stock.packaging.type === 'BOX') {
          quantity = this.SheetToReamQuantity(
            quantity * stock.packaging.packA * stock.packaging.packB,
          );
        }
        break;
      case 'WON_PER_TON':
        // 수량을 TON으로
        if (
          stock.packaging.type === 'SKID' ||
          stock.packaging.type === 'REAM'
        ) {
          quantity = this.SheetToTonQuantity(
            quantity,
            stock.grammage,
            stock.sizeX,
            stock.sizeY,
          );
        } else if (stock.packaging.type === 'BOX') {
          quantity = this.SheetToTonQuantity(
            quantity * stock.packaging.packA * stock.packaging.packB,
            stock.grammage,
            stock.sizeX,
            stock.sizeY,
          );
        }
        break;
    }

    return stockPrice.unitPrice * quantity;
  }

  async getStockGroupList(params: {
    companyId: number;
    skip: number;
    take: number;
    planId: 'any' | number;
    isDirectShippingIncluded: boolean;
    isZeroQuantityIncluded: boolean;
    initialPlanId: number | null;
    orderProcessIncluded: boolean;
    warehouseIds: number[];
    packagingIds: number[];
    paperTypeIds: number[];
    manufacturerIds: number[];
    minGrammage: number | null;
    maxGrammage: number | null;
    sizeX: number | null;
    sizeY: number | null;
    partnerCompanyRegistrationNumbers: string[];
    locationIds: number[];
    minWantedDate: string | null;
    maxWantedDate: string | null;
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
      orderProcessIncluded,
      warehouseIds,
      packagingIds,
      paperTypeIds,
      manufacturerIds,
      minGrammage,
      maxGrammage,
      sizeX,
      sizeY,
      partnerCompanyRegistrationNumbers,
      locationIds,
      minWantedDate,
      maxWantedDate,
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
          (
            (initialOs.id IS NULL AND initialOp.id IS NULL AND initialPs.planId IS NULL) OR
            (initialOs.id IS NOT NULL AND initialOs.isDirectShipping = ${false}) OR
            (initialPs.planId IS NOT NULL AND initialPs.isDirectShipping = ${false}) OR
            (initialOp.id IS NOT NULL AND initialO.srcCompanyId = ${companyId} AND initialOp.isSrcDirectShipping = ${false}) OR
            (initialOp.id IS NOT NULL AND initialO.dstCompanyId = ${companyId} AND initialOp.isDstDirectShipping = ${false})
          ) AND ((initialOs.id IS NULL AND initialOp.id IS NULL AND initialPs.planId IS NULL) OR s.cachedQuantityAvailable != 0)
        )`;
    const zeroQuantityQuery = isZeroQuantityIncluded
      ? Prisma.empty
      : Prisma.sql`AND availableQuantity != 0 OR totalQuantity != 0`;

    const initialPlanQuery = initialPlanId
      ? Prisma.sql`AND s.initialPlanId = ${initialPlanId}`
      : Prisma.empty;

    const orderProcessIncludedQuery = orderProcessIncluded
      ? Prisma.sql`OR (initialO.id IS NOT NULL AND initialO.orderType = ${OrderType.OUTSOURCE_PROCESS} AND initialO.dstCompanyId = ${companyId} AND s.planId IS NOT NULL)`
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
      ? Prisma.sql`AND (s.sizeY >= ${sizeY} OR s.sizeY = 0)`
      : Prisma.empty;

    const partnerCompanyQuery =
      partnerCompanyRegistrationNumbers.length > 0
        ? Prisma.sql`AND partnerCompany.companyRegistrationNumber IN (${Prisma.join(
            partnerCompanyRegistrationNumbers,
          )})`
        : Prisma.empty;
    const locationQuery =
      locationIds.length > 0
        ? Prisma.sql`AND (CASE
          WHEN os.id IS NOT NULL THEN os.dstLocationId IN (${Prisma.join(
            locationIds,
          )})
          WHEN op.id IS NOT NULL THEN (op.srcLocationId IN (${Prisma.join(
            locationIds,
          )}) OR op.dstLocationId IN (${Prisma.join(locationIds)}))
          WHEN ps.planId IS NOT NULL THEN ps.dstLocationId IN (${Prisma.join(
            locationIds,
          )})
        ELSE 1 = 0
      END)`
        : Prisma.empty;

    const minWantedDateQuery = minWantedDate
      ? Prisma.sql`AND (CASE
      WHEN os.id IS NOT NULL THEN os.wantedDate >= ${minWantedDate}
      WHEN ps.planId IS NOT NULL THEN ps.wantedDate >= ${minWantedDate}
      WHEN op.id IS NOT NULL THEN (op.srcWantedDate >= ${minWantedDate} OR op.dstWantedDate >= ${minWantedDate})
      ELSE 1 = 0
    END)`
      : Prisma.empty;
    const maxWantedDateQuery = maxWantedDate
      ? Prisma.sql`AND (CASE
      WHEN os.id IS NOT NULL THEN os.wantedDate <= ${maxWantedDate}
      WHEN ps.planId IS NOT NULL THEN ps.wantedDate <= ${maxWantedDate}
      WHEN op.id IS NOT NULL THEN (op.srcWantedDate <= ${maxWantedDate} OR op.dstWantedDate <= ${maxWantedDate})
      ELSE 1 = 0
    END)`
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
            , os.isDirectShipping AS osIsDirectShipping
            , os.wantedDate AS osWantedDate

            , op.id AS orderProcessId
            , opDstLocation.id AS opDstLocationId
            , opDstLocation.name AS opDstLocationName
            , opDstLocation.isPublic AS opDstLocationIsPublic
            , opDstLocation.address AS opDstLocationAddress
            , op.dstWantedDate AS opDstWantedDate
            , op.isSrcDirectShipping As opIsSrcDirectShipping
            , op.isDstDirectShipping As opIsDstDirectShipping
            
            , opSrcLocation.id AS opSrcLocationId
            , opSrcLocation.name AS opSrcLocationName
            , opSrcLocation.isPublic AS opSrcLocationIsPublic
            , opSrcLocation.address AS opSrcLocationAddress
            , op.srcWantedDate AS opSrcWtantedDate

            , psLocation.id AS psLocationId
            , psLocation.name AS psLocationName
            , psLocation.isPublic AS psLocationIsPublic
            , psLocation.address AS psLocationAddress
            , ps.isDirectShipping AS psIsDirectShipping

            -- 거래처 정보
            , partnerCompany.id AS partnerCompanyId
            , partnerCompany.businessName As partnerCompanyBusinessName
            , partnerCompany.companyRegistrationNumber As partnerCompanyRegistrationNumber
            , partnerCompany.invoiceCode AS partnerCompanyInvoiceCode
            , partnerCompany.bizType AS partnerCompanyBizType
            , partnerCompany.bizItem AS partnerCompanyBizItem
            , partnerCompany.representative AS partnerCompanyRepresentative
            , partnerCompany.address AS partnerCompanyAddress
            , partnerCompany.phoneNo AS partnerCompanyPhoneNo
            , partnerCompany.faxNo As partnerCompanyFaxNo
            , partnerCompany.managedById AS partnerCompanyManagedById

            -- 구매회사
            , srcCompany.id AS srcCompanyId
            , srcCompany.businessName As srcCompanyBusinessName
            , srcCompany.companyRegistrationNumber As srcCompanyRegistrationNumber
            , srcCompany.invoiceCode AS srcCompanyInvoiceCode
            , srcCompany.bizType AS srcCompanyBizType
            , srcCompany.bizItem AS srcCompanyBizItem
            , srcCompany.representative AS srcCompanyRepresentative
            , srcCompany.address AS srcCompanyAddress
            , srcCompany.phoneNo AS srcCompanyPhoneNo
            , srcCompany.faxNo As srcCompanyFaxNo
            , srcCompany.managedById AS srcCompanyManagedById

            -- 판매회사
            , dstCompany.id AS dstCompanyId
            , dstCompany.businessName As dstCompanyBusinessName
            , dstCompany.companyRegistrationNumber As dstCompanyRegistrationNumber
            , dstCompany.invoiceCode AS dstCompanyInvoiceCode
            , dstCompany.bizType AS dstCompanyBizType
            , dstCompany.bizItem AS dstCompanyBizItem
            , dstCompany.representative AS dstCompanyRepresentative
            , dstCompany.address AS dstCompanyAddress
            , dstCompany.phoneNo AS dstCompanyPhoneNo
            , dstCompany.faxNo As dstCompanyFaxNo
            , dstCompany.managedById AS dstCompanyManagedById

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

            -- 손실율
            , (CASE 
              WHEN ${sizeX} IS NOT NULL AND ${sizeY} IS NOT NULL 
              THEN (
                CASE 
                  WHEN s.sizeY = 0 THEN (s.sizeX % ${sizeX}) * (1/${sizeX}) * 100
                  ELSE (((s.sizeX * s.sizeY) / ((${sizeX} * FLOOR(s.sizeX/${sizeX})) * (${sizeY} * FLOOR(s.sizeY/${sizeY})))) - 1) * 100
                END
              )

              WHEN ${sizeX} IS NOT NULL
              THEN (s.sizeX % ${sizeX}) * (1/${sizeX}) * 100

              WHEN ${sizeY} IS NOT NULL 
              THEN (
                CASE 
                  WHEN s.sizeY = 0 THEN NULL
                  ELSE (s.sizeY % ${sizeY}) * (1/${sizeY}) * 100
                END
              )

              ELSE NULL
            END) AS lossRate

            -- total
            , COUNT(1) OVER() AS total

        FROM Stock              AS s
        JOIN (
          SELECT *, COUNT(1) OVER(PARTITION BY stockId ORDER BY stockId)
            FROM StockEvent
        ) AS firstStockEvent ON firstStockEvent.stockId = s.id AND firstStockEvent.status != ${StockEventStatus.CANCELLED}
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

   LEFT JOIN OrderProcess       AS op                       ON op.id = p.orderProcessId
   LEFT JOIN \`Location\`       AS opSrcLocation            ON opSrcLocation.id = op.srcLocationId
   LEFT JOIN \`Location\`       AS opDstLocation            ON opDstLocation.id = op.dstLocationId

   LEFT JOIN \`Order\`          AS o                        ON o.id = (CASE 
                                                                        WHEN os.orderId IS NOT NULL THEN os.orderId 
                                                                        WHEN op.orderId IS NOT NULL THEN op.orderId 
                                                                        ELSE 0
                                                                      END)
   LEFT JOIN Company            AS partnerCompany           ON partnerCompany.id =  IF(o.srcCompanyId = ${companyId}, o.dstCompanyId, o.srcCompanyId)
   LEFT JOIN Company            AS srcCompany               ON srcCompany.id =  o.srcCompanyId
   LEFT JOIN Company            AS dstCompany               ON dstCompany.id =  o.dstCompanyId

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
                ${orderProcessIncludedQuery}
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
         ${partnerCompanyQuery}
         ${locationQuery}
         ${minWantedDateQuery}
         ${maxWantedDateQuery}

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

        HAVING (availableQuantity >= 0)
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
                            sg.partnerCompanyRegistrationNumber,
                          invoiceCode: sg.partnerCompanyInvoiceCode,
                          bizType: sg.partnerCompanyBizType,
                          bizItem: sg.partnerCompanyBizItem,
                          representative: sg.partnerCompanyRepresentative,
                          address: sg.partnerCompanyAddress,
                          phoneNo: sg.partnerCompanyPhoneNo,
                          faxNo: sg.partnerCompanyFaxNo,
                          managedById: sg.partnerCompanyManagedById,
                        },
                        srcCompany: {
                          id: sg.srcCompanyId,
                          businessName: sg.srcCompanyBusinessName,
                          companyRegistrationNumber:
                            sg.srcCompanyRegistrationNumber,
                          invoiceCode: sg.srcCompanyInvoiceCode,
                          bizType: sg.srcCompanyBizType,
                          bizItem: sg.srcCompanyBizItem,
                          representative: sg.srcCompanyRepresentative,
                          address: sg.srcCompanyAddress,
                          phoneNo: sg.srcCompanyPhoneNo,
                          faxNo: sg.srcCompanyFaxNo,
                          managedById: sg.srcCompanyManagedById,
                        },
                        dstCompany: {
                          id: sg.dstCompanyId,
                          businessName: sg.dstCompanyBusinessName,
                          companyRegistrationNumber:
                            sg.dstCompanyRegistrationNumber,
                          invoiceCode: sg.dstCompanyInvoiceCode,
                          bizType: sg.dstCompanyBizType,
                          bizItem: sg.dstCompanyBizItem,
                          representative: sg.dstCompanyRepresentative,
                          address: sg.dstCompanyAddress,
                          phoneNo: sg.dstCompanyPhoneNo,
                          faxNo: sg.dstCompanyFaxNo,
                          managedById: sg.dstCompanyManagedById,
                        },
                      },
                      dstLocation: {
                        id: sg.osDstLocationId,
                        name: sg.osDstLocationName,
                        isPublic: sg.osDstLocationIsPublic,
                        address: sg.osDstLocationAddress,
                        phoneNo: sg.osDstLocationPhoneNo,
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
                        phoneNo: sg.opSrcLocationPhoneNo,
                      },
                      dstLocation: {
                        id: sg.opDstLocationId,
                        name: sg.opDstLocationName,
                        isPublic: sg.opDstLocationIsPublic,
                        address: sg.opDstLocationAddress,
                        phoneNo: sg.opDstLocationPhoneNo,
                      },
                      order: {
                        id: sg.orderId,
                        orderNo: sg.orderNo,
                        orderType: sg.orderType,
                        partnerCompany: {
                          id: sg.partnerCompanyId,
                          businessName: sg.partnerCompanyBusinessName,
                          companyRegistrationNumber:
                            sg.partnerCompanyRegistrationNumber,
                          invoiceCode: sg.partnerCompanyInvoiceCode,
                          bizType: sg.partnerCompanyBizType,
                          bizItem: sg.partnerCompanyBizItem,
                          representative: sg.partnerCompanyRepresentative,
                          address: sg.partnerCompanyAddress,
                          phoneNo: sg.partnerCompanyPhoneNo,
                          faxNo: sg.partnerCompanyFaxNo,
                          managedById: sg.partnerCompanyManagedById,
                        },
                        srcCompany: {
                          id: sg.srcCompanyId,
                          businessName: sg.srcCompanyBusinessName,
                          companyRegistrationNumber:
                            sg.srcCompanyRegistrationNumber,
                          invoiceCode: sg.srcCompanyInvoiceCode,
                          bizType: sg.srcCompanyBizType,
                          bizItem: sg.srcCompanyBizItem,
                          representative: sg.srcCompanyRepresentative,
                          address: sg.srcCompanyAddress,
                          phoneNo: sg.srcCompanyPhoneNo,
                          faxNo: sg.srcCompanyFaxNo,
                          managedById: sg.srcCompanyManagedById,
                        },
                        dstCompany: {
                          id: sg.dstCompanyId,
                          businessName: sg.dstCompanyBusinessName,
                          companyRegistrationNumber:
                            sg.dstCompanyRegistrationNumber,
                          invoiceCode: sg.dstCompanyInvoiceCode,
                          bizType: sg.dstCompanyBizType,
                          bizItem: sg.dstCompanyBizItem,
                          representative: sg.dstCompanyRepresentative,
                          address: sg.dstCompanyAddress,
                          phoneNo: sg.dstCompanyPhoneNo,
                          faxNo: sg.dstCompanyFaxNo,
                          managedById: sg.dstCompanyManagedById,
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
                        phoneNo: sg.psLocationPhoneNo,
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
          lossRate: sg.lossRate === null ? null : Number(sg.lossRate),
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
    const stocks = await this.getStockList(
      {
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
        initialPlan: undefined,
      },
      false,
    );

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

  async getStockList(
    data: Prisma.StockWhereInput,
    isZeroQuantityIncluded: boolean,
  ) {
    const warehouseId = data.initialPlanId
      ? Prisma.sql`AND s.planId IS NULL`
      : Prisma.sql`AND s.warehouseId = ${data.warehouseId} AND s.planId IS NULL`;
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
    const initialPlanQuery = data.initialPlanId
      ? Prisma.sql`AND s.initialPlanId = ${data.initialPlanId}`
      : Prisma.empty;
    const zeroQuantityQuery = isZeroQuantityIncluded
      ? Prisma.empty
      : Prisma.sql`AND (s.cachedQuantity != 0 OR cachedQuantityAvailable != 0)`;

    const stockIds: { id: number }[] = await this.prisma.$queryRaw`
      SELECT s.id
        FROM Stock      AS s
        JOIN (
          SELECT *, ROW_NUMBER() OVER(PARTITION BY stockId ORDER BY id ASC) AS rownum
            FROM StockEvent
           WHERE \`change\` > 0 AND \`status\` = ${StockEventStatus.NORMAL}
        ) AS outputSe ON outputSe.stockId = s.id

       WHERE s.companyId = ${data.companyId}
         ${warehouseId}
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
         
         ${initialPlanQuery}
         ${zeroQuantityQuery}
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

  async getPlanStockGroups(
    companyId: number,
    planId: number,
  ): Promise<Model.PlanStockGroup[]> {
    const stockGroups: PlanStockGroupFromDB[] = await this.prisma.$queryRaw`
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
            , osDstLocation.phoneNo AS osDstLocationPhoneNo
            , os.wantedDate AS osWantedDate
            , os.isDirectShipping AS osIsDirectShipping

            , op.id AS orderProcessId
            , opDstLocation.id AS opDstLocationId
            , opDstLocation.name AS opDstLocationName
            , opDstLocation.isPublic AS opDstLocationIsPublic
            , opDstLocation.address AS opDstLocationAddress
            , opDstLocation.phoneNo AS opDstLocationPhoneNo
            , op.dstWantedDate AS opDstWantedDate
            , op.isSrcDirectShipping AS opIsSrcDirectShipping
            , op.isDstDirectShipping AS opIsDstDirectShipping
            
            , opSrcLocation.id AS opSrcLocationId
            , opSrcLocation.name AS opSrcLocationName
            , opSrcLocation.isPublic AS opSrcLocationIsPublic
            , opSrcLocation.address AS opSrcLocationAddress
            , opSrcLocation.phoneNo AS opSrcLocationPhoneNo
            , op.srcWantedDate AS opSrcWtantedDate

            , psLocation.id AS psLocationId
            , psLocation.name AS psLocationName
            , psLocation.isPublic AS psLocationIsPublic
            , psLocation.address AS psLocationAddress
            , psLocation.phoneNo AS psLocationPhoneNo
            , ps.isDirectShipping AS psIsDirectShipping

            -- 배정
            , (CASE
                WHEN s.planId IS NOT NULL THEN IF((
                  SELECT COUNT(1) 
                    FROM Stock AS s2
                    JOIN (
                      SELECT *, ROW_NUMBER() OVER(PARTITION BY stockId ORDER BY id ASC) AS firstStockEventNum
                        FROM StockEvent
                      WHERE status != ${StockEventStatus.CANCELLED}
                    ) AS firstStockEvent ON firstStockEvent.stockId = s2.id
                   WHERE s2.planId = s.planId
                     AND s2.packagingId = s.packagingId
                     AND s2.productId = s.productId
                     AND s2.sizeX = s.sizeX
                     AND s2.sizeY = s.sizeY
                     AND IF(s.paperColorGroupId IS NULL, s2.paperColorGroupId IS NULL, s2.paperColorGroupId = s.paperColorGroupId)
                     AND IF(s.paperColorId IS NULL, s2.paperColorId IS NULL, s2.paperColorId = s.paperColorId)
                     AND IF(s.paperPatternId IS NULL, s2.paperPatternId IS NULL, s2.paperPatternId = s.paperPatternId)
                     AND IF(s.paperCertId IS NULL, s2.paperCertId IS NULL, s2.paperCertId = s.paperCertId)
                ) > 1, 1, 0)
                ELSE 1
              END) AS isAssigned

            -- 수량
            , firstStockEvent.change AS quantity
      
            , ROW_NUMBER() OVER(PARTITION BY 
                            s.packagingId
                            , s.productId
                            , s.grammage
                            , s.sizeX
                            , s.sizeY
                            , s.paperColorGroupId
                            , s.paperColorId
                            , s.paperPatternId
                            , s.paperCertId) AS num

        -- 재고정보
        FROM Stock          AS s
        JOIN (
          SELECT *, ROW_NUMBER() OVER(PARTITION BY stockId ORDER BY id ASC) AS eventNum
            FROM StockEvent
           WHERE status != ${StockEventStatus.CANCELLED}
        ) AS firstStockEvent ON firstStockEvent.stockId = s.id

   LEFT JOIN Warehouse          AS w                        ON w.id = s.warehouseId
   LEFT JOIN Plan               AS p                        ON p.id = s.planId
   LEFT JOIN PlanShipping       AS ps                       ON ps.planId = p.id
   LEFT JOIN Location           AS psLocation               ON psLocation.id = ps.dstLocationId

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

      -- initialPlan
   LEFT JOIN Plan               AS initialP                 ON initialP.id = s.initialPlanId
   LEFT JOIN OrderStock         AS initialOs                ON initialOs.id = initialP.orderStockId
   LEFT JOIN OrderProcess       AS initialOp                ON initialOp.id = initialP.orderProcessId
   LEFT JOIN PlanShipping       AS initialPs                ON initialPs.planId = initialP.id
   LEFT JOIN \`Order\`          AS initialO                 ON initialO.id = (CASE 
                                                                              WHEN initialOs.orderId IS NOT NULL THEN initialOs.orderId
                                                                              WHEN initialOp.orderId IS NOT NULL THEN initialOp.orderId
                                                                              ELSE 0
                                                                             END)

     -- 거래 정보 (직송여부, 거래처 정보 등)
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

       WHERE s.companyId = ${companyId}
         AND s.initialPlanId = ${planId}
         AND firstStockEvent.change >= 0
         AND firstStockEvent.status != ${StockEventStatus.CANCELLED}
    `;

    return stockGroups.map((sg) => {
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
                    isDirectShipping: sg.osIsDirectShipping === 1,
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
                        bizType: sg.partnerCompanyBizType,
                        bizItem: sg.partnerCompanyBizItem,
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
                      phoneNo: sg.osDstLocationPhoneNo,
                    },
                  }
                : null,
              orderProcess: sg.orderProcessId
                ? {
                    srcWantedDate: sg.opSrcWtantedDate,
                    dstWantedDate: sg.opDstWantedDate,
                    isSrcDirectShipping: sg.opIsSrcDirectShipping === 1,
                    isDstDriectShipping: sg.opIsDstDirectShipping === 1,
                    srcLocation: {
                      id: sg.opSrcLocationId,
                      name: sg.opSrcLocationName,
                      isPublic: sg.opSrcLocationIsPublic,
                      address: sg.opSrcLocationAddress,
                      phoneNo: sg.opSrcLocationPhoneNo,
                    },
                    dstLocation: {
                      id: sg.opDstLocationId,
                      name: sg.opDstLocationName,
                      isPublic: sg.opDstLocationIsPublic,
                      address: sg.opDstLocationAddress,
                      phoneNo: sg.opDstLocationPhoneNo,
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
                        bizType: sg.partnerCompanyBizType,
                        bizItem: sg.partnerCompanyBizItem,
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
                    isDirectShipping: sg.psIsDirectShipping === 1,
                    dstLocation: {
                      id: sg.psLocationId,
                      name: sg.psLocationName,
                      isPublic: sg.psLocationIsPublic,
                      address: sg.psLocationAddress,
                      phoneNo: sg.psLocationPhoneNo,
                    },
                  }
                : null,
            }
          : null,
        isAssigned: Number(sg.isAssigned) === 1,
        quantity: Number(sg.quantity),
      };
    });
  }

  async getArrivalStockPrice(params: {
    companyId: number;
    planId: number;
    productId: number;
    packagingId: number;
    grammage: number;
    sizeX: number;
    sizeY: number | null;
    paperColorGroupId: number | null;
    paperColorId: number | null;
    paperPatternId: number | null;
    paperCertId: number | null;
  }): Promise<Model.StockPrice> {
    const stocks = await this.prisma.stock.findMany({
      select: {
        stockPrice: {
          select: STOCK_PRICE,
        },
      },
      where: {
        companyId: params.companyId,
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
        stockEvent: {
          some: {
            status: {
              not: 'CANCELLED',
            },
          },
        },
      },
    });
    if (stocks.length === 0)
      throw new NotFoundException(`존재하지 않는 도착예정재고 입니다.`);

    return stocks[0].stockPrice;
  }
}
