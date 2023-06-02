import { Injectable } from '@nestjs/common';
import { PackagingType, Prisma, StockEventStatus } from '@prisma/client';
import { PrismaService } from 'src/core';

// export interface PartnerStockGroupFromDB {
//   warehouseId: number;
//   warehouseName: string;
//   warehouseCode: string;
//   warehouseIsPublic: boolean;
//   warehouseAddress: string;

//   partnerCompanyId: number;
//   partnerCompanyBusinessName: string;
//   partnerCompanyRegistrationNumber: string;
//   partnerCompanyInvoiceCode: string;
//   partnerCompanyRepresentative: string;
//   partnerCompanyAddress: string;
//   partnerCompanyPhoneNo: string;
//   partnerCompanyFaxNo: string;
//   partnerCompanyEmail: string;
//   partnerCompanyManagedById: number;

//   packagingId: number;
//   packagingName: string;
//   packagingType: PackagingType;
//   packagingPackA: number;
//   packagingPackB: number;

//   productId: number;
//   paperDomainId: number;
//   paperDomainName: string;
//   paperGroupId: number;
//   paperGroupName: string;
//   manufacturerId: number;
//   manufacturerName: string;
//   paperTypeId: number;
//   paperTypeName: string;

//   grammage: number;
//   sizeX: number;
//   sizeY: number;

//   paperColorGroupId: number;
//   paperColorGroupName: string;
//   paperColorId: number;
//   paperColorName: string;
//   paperPatternId: number;
//   paperPatternName: string;
//   paperCertId: number;
//   paperCertName: string;

//   totalQuantity: number;
//   availableQuantity: number;
//   total: bigint;
// }

// @Injectable()
// export class PartnerStockRetriveService {
//   constructor(private readonly prisma: PrismaService) { }

//   async getStockGroupList(
//     companyId: number,
//     skip: number,
//     take: number,
//     partnerCompanyId: number | null,
//   ) {
//     const limit = take ? Prisma.sql`LIMIT ${skip}, ${take}` : Prisma.empty;
//     const companyConditionQuery = partnerCompanyId
//       ? Prisma.sql`AND br.srcCompanyId = ${partnerCompanyId}`
//       : Prisma.empty;

//     const stockGroups: PartnerStockGroupFromDB[] = await this.prisma.$queryRaw`
//                 SELECT sg.id AS stockGroupId
//                     , w.id As warehouseId
//                     , w.name AS warehouseName
//                     , w.code AS warehouseCode
//                     , w.isPublic AS warehouseIsPublic
//                     , w.address AS warehouseAddress

//                     # 거래처 정보
//                     , srcCompany.id AS partnerCompanyId
//                     , srcCompany.businessName As partnerCompanyBusinessName
//                     , srcCompany.companyRegistrationNumber As partnerCompanyCompanyRegistrationNumber
//                     , srcCompany.invoiceCode AS partnerCompanyInvoiceCode
//                     , srcCompany.representative AS partnerCompanyRepresentative
//                     , srcCompany.address AS partnerCompanyAddress
//                     , srcCompany.phoneNo AS partnerCompanyPhoneNo
//                     , srcCompany.faxNo As partnerCompanyFaxNo
//                     , srcCompany.email AS partnerCompanyEmail
//                     , srcCompany.managedById AS partnerCompanyManagedById

//                     # 메타데이터
//                     , product.id AS productId
//                     , paperDomain.id AS paperDomainId
//                     , paperDomain.name AS paperDomainName
//                     , manufacturer.id AS manufacturerId
//                     , manufacturer.name AS manufacturerName
//                     , paperGroup.id AS paperGroupId
//                     , paperGroup.name AS paperGroupName
//                     , paperType.id AS paperTypeId
//                     , paperType.name AS paperTypeName
//                     , packaging.id AS packagingId
//                     , packaging.name AS packagingName
//                     , packaging.type AS packagingType
//                     , packaging.packA AS packagingPackA
//                     , packaging.packB AS packagingPackB
//                     , paperColorGroup.id AS paperColorGroupId
//                     , paperColorGroup.name AS paperColorGroupName
//                     , paperColor.id AS paperColorId
//                     , paperColor.name AS paperColorName
//                     , paperPattern.id AS paperPatternId
//                     , paperPattern.name AS paperPatternName
//                     , paperCert.id AS paperCertId
//                     , paperCert.name AS paperCertName
//                     , sg.grammage AS grammage
//                     , sg.sizeX AS sizeX
//                     , sg.sizeY AS sizeY

//                     # 수량
//                     , IFNULL(SUM(s.cachedQuantityAvailable), 0) + IFNULL(StockGroupPendingEvent.change, 0) AS availableQuantity
//                     , IFNULL(SUM(s.cachedQuantity), 0) AS totalQuantity

//                     , COUNT(1) OVER() AS total

//                   FROM Company                      AS c
//                   JOIN BusinessRelationship         AS br                 ON br.dstCompanyId = c.id
//                   JOIN Company                      AS srcCompany         ON srcCompany.id = br.srcCompanyId
//                   JOIN StockGroup                   AS sg                 ON sg.companyId = srcCompany.id
//              LEFT JOIN Warehouse                    AS w                  ON w.id = sg.warehouseId

//               # 메타데이터
//                   JOIN Product                      AS product            ON product.id = sg.productId
//                   JOIN PaperDomain                  AS paperDomain        ON paperDomain.id = product.paperDomainId
//                   JOIN Manufacturer                 AS manufacturer       ON manufacturer.id = product.manufacturerId
//                   JOIN PaperGroup                   AS paperGroup         ON paperGroup.id = product.paperGroupId
//                   JOIN PaperType                    AS paperType          ON paperType.id = product.paperTypeId
//                   JOIN Packaging                    AS packaging          ON packaging.id = sg.packagingId
//              LEFT JOIN PaperColorGroup              AS paperColorGroup    ON paperColorGroup.id = sg.paperColorGroupId
//              LEFT JOIN PaperColor                   AS paperColor         ON paperColor.id = sg.paperColorId
//              LEFT JOIN PaperPattern                 AS paperPattern       ON paperPattern.id = sg.paperPatternId
//              LEFT JOIN PaperCert                    AS paperCert          ON paperCert.id = sg.paperCertId

//              # 수량
//             ## 재고그룹
//          LEFT JOIN (
//             SELECT StockGroup.*, IFNULL(SUM(StockGroupEvent.change), 0) AS \`change\`
//               FROM StockGroup
//               JOIN StockGroupEvent ON StockGroupEvent.stockGroupId = StockGroup.id
//              WHERE StockGroupEvent.status = ${StockGroupEventStatus.PENDING}
//             GROUP BY StockGroup.id
//           ) AS StockGroupPendingEvent ON StockGroupPendingEvent.id = sg.id

//             ## 재고
//          LEFT JOIN Stock                    AS s                  ON s.productId = sg.productId
//                                                                   AND s.packagingId = sg.packagingId
//                                                                   AND s.grammage = sg.grammage
//                                                                   AND s.sizeX = sg.sizeX
//                                                                   AND s.sizeY = sg.sizeY
//                                                                   AND IF(s.paperColorGroupId IS NULL, s.paperColorGroupId IS NULL, s.paperColorGroupId = sg.paperColorGroupId)
//                                                                   AND IF(s.paperColorId IS NULL, s.paperColorId IS NULL, s.paperColorId = sg.paperColorId)
//                                                                   AND IF(s.paperPatternId IS NULL, s.paperPatternId IS NULL, s.paperPatternId = sg.paperPatternId)
//                                                                   AND IF(s.paperCertId IS NULL, s.paperCertId IS NULL, s.paperCertId = sg.paperCertId)
//                                                                   AND s.warehouseId = sg.warehouseId
//                                                                   AND s.companyId = sg.companyId
//                                                                   # 주문관련은 필터링 필요

//                  WHERE c.id = ${companyId}
//                    AND w.isPublic = ${true}
//                    AND sg.isArrived IS NULL
//                    ${companyConditionQuery}

//             GROUP BY sg.id

//                  ${limit}
//             `;

//     const total = stockGroups.length === 0 ? 0 : Number(stockGroups[0].total);
//     for (const stockGroup of stockGroups) {
//       stockGroup.totalQuantity = Number(stockGroup.totalQuantity);
//       stockGroup.availableQuantity = Number(stockGroup.availableQuantity);
//       delete stockGroup.total;
//     }

//     return { stockGroups, total };
//   }
// }
