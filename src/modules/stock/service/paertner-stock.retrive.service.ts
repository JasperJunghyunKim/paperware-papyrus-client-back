import { Injectable } from '@nestjs/common';
import { PackagingType, Prisma, StockEventStatus } from '@prisma/client';
import { PrismaService } from 'src/core';

export interface PartnerStockGroupFromDB {
  warehouseId: number;
  warehouseName: string;
  warehouseCode: string;
  warehouseIsPublic: boolean;
  warehouseAddress: string;

  partnerCompanyId: number;
  partnerCompanyBusinessName: string;
  partnerCompanyRegistrationNumber: string;
  partnerCompanyInvoiceCode: string;
  partnerCompanyRepresentative: string;
  partnerCompanyAddress: string;
  partnerCompanyPhoneNo: string;
  partnerCompanyFaxNo: string;
  partnerCompanyEmail: string;
  partnerCompanyManagedById: number;

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
  total: bigint;
}

@Injectable()
export class PartnerStockRetriveService {
  constructor(private readonly prisma: PrismaService) { }

  async getStockGroupList(
    companyId: number,
    skip: number,
    take: number,
    partnerCompanyId: number | null,
  ) {
    const limit = take ? Prisma.sql`LIMIT ${skip}, ${take}` : Prisma.empty;
    const companyConditionQuery = partnerCompanyId
      ? Prisma.sql`AND br.srcCompanyId = ${partnerCompanyId}`
      : Prisma.empty;

    const stockGroups: PartnerStockGroupFromDB[] = await this.prisma.$queryRaw`
                SELECT s.warehouseId AS warehouseId
                        , w.name AS warehouseName
                        , w.code AS warehouseCode
                        , w.isPublic AS warehouseIsPublic
                        , w.address AS warehouseAddress

                        , srcCompany.id AS partnerCompanyId
                        , srcCompany.businessName AS partnerCompanyBusinessName
                        , srcCompany.companyRegistrationNumber AS partnerCompanyRegistrationNumber
                        , srcCompany.invoiceCode AS partnerCompanyInvoiceCode
                        , srcCompany.representative AS partnerCompanyRepresentative
                        , srcCompany.address AS partnerCompanyAddress
                        , srcCompany.phoneNo AS partnerCompanyPhoneNo
                        , srcCompany.faxNo AS partnerCompanyFaxNo
                        , srcCompany.email AS partnerCompanyEmail
                        , srcCompany.managedById AS partnerCompanyManagedById

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

                        , IFNULL(SUM(s.cachedQuantity), 0) / IF(packaging.type = ${PackagingType.ROLL}, 1000000, 1) AS totalQuantity
                        , IFNULL(SUM(s.cachedQuantityAvailable), 0) / IF(packaging.type = ${PackagingType.ROLL}, 1000000, 1) + IFNULL(SUM(allocStockGroup.change), 0) AS availableQuantity
                        , COUNT(1) OVER() AS total

                  FROM Company                  AS c
                  JOIN BusinessRelationship     AS br               ON br.dstCompanyId = c.id
                  JOIN Company                  AS srcCompany       ON srcCompany.id = br.srcCompanyId
                  JOIN Stock                    AS s                ON s.companyId = br.srcCompanyId
                  JOIN StockEvent               AS se               ON se.stockId = s.id
                  JOIN Warehouse                AS w                ON w.id = s.warehouseId

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

             # 부모재고 할당
             LEFT JOIN (
                SELECT StockGroup.*, SUM(StockGroupEvent.change) AS \`change\`
                  FROM StockGroup
                  JOIN StockGroupEvent ON StockGroupEvent.stockGroupId = StockGroup.id
                GROUP BY StockGroup.id
             ) AS allocStockGroup ON allocStockGroup.productId = s.productId
                                  AND allocStockGroup.packagingId = s.packagingId
                                  AND allocStockGroup.grammage = s.grammage
                                  AND allocStockGroup.sizeX = s.sizeX
                                  AND allocStockGroup.sizeY = s.sizeY
                                  AND allocStockGroup.companyId = s.companyId
                                  AND IF(s.paperColorGroupId IS NULL, allocStockGroup.paperColorGroupId IS NULL, allocStockGroup.paperColorGroupId = s.paperColorGroupId)
                                  AND IF(s.paperColorId IS NULL, allocStockGroup.paperColorId IS NULL, allocStockGroup.paperColorId = s.paperColorId)
                                  AND IF(s.paperPatternId IS NULL, allocStockGroup.paperPatternId IS NULL, allocStockGroup.paperPatternId = s.paperPatternId)
                                  AND IF(s.paperCertId IS NULL, allocStockGroup.paperCertId IS NULL, allocStockGroup.paperCertId = s.paperCertId)
                                  AND IF(s.warehouseId IS NULL, allocStockGroup.warehouseId IS NULL, allocStockGroup.warehouseId = s.warehouseId)
                                  AND allocStockGroup.orderStockId IS NULL

                 WHERE c.id = ${companyId}
                   AND se.status IN (${StockEventStatus.NORMAL}, ${StockEventStatus.PENDING})
                   ${companyConditionQuery}

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
                        , srcCompany.id
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
}
