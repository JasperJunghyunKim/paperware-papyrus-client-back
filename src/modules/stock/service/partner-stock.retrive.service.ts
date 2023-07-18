import { Injectable } from '@nestjs/common';
import { PackagingType, Prisma, StockEventStatus } from '@prisma/client';
import { StockGroup } from 'src/@shared/models';
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
  lossRate: number | null;
  total: bigint;
}

@Injectable()
export class PartnerStockRetriveService {
  constructor(private readonly prisma: PrismaService) {}

  async getStockGroupList(
    companyId: number,
    skip: number,
    take: number,
    partnerCompanyId: number | null,
    packagingIds: number[],
    paperTypeIds: number[],
    manufacturerIds: number[],
    minGrammage: number | null,
    maxGrammage: number | null,
    sizeX: number | null,
    sizeY: number | null,
  ): Promise<{
    items: (StockGroup & { partnerCompanyRegistrationNumber: string })[];
    total: number;
  }> {
    const limit = take ? Prisma.sql`LIMIT ${skip}, ${take}` : Prisma.empty;
    const companyConditionQuery = partnerCompanyId
      ? Prisma.sql`AND br.srcCompanyId = ${partnerCompanyId}`
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

    const stockGroups: PartnerStockGroupFromDB[] = await this.prisma.$queryRaw`
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
      
                  -- 거래처 정보
                  , srcCompany.id AS partnerCompanyId
                  , srcCompany.businessName As partnerCompanyBusinessName
                  , srcCompany.companyRegistrationNumber As partnerCompanyRegistrationNumber
                  , srcCompany.invoiceCode AS partnerCompanyInvoiceCode
                  , srcCompany.representative AS partnerCompanyRepresentative
                  , srcCompany.address AS partnerCompanyAddress
                  , srcCompany.phoneNo AS partnerCompanyPhoneNo
                  , srcCompany.faxNo As partnerCompanyFaxNo
                  , srcCompany.managedById AS partnerCompanyManagedById
      
                  -- 수량
                  , IFNULL(SUM(s.cachedQuantityAvailable), 0) AS availableQuantity
                  , IFNULL(SUM(s.cachedQuantity), 0) AS totalQuantity

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

              FROM Company                      AS myCompany
              JOIN BusinessRelationship         AS br             ON br.dstCompanyId = myCompany.id
              JOIN Company                      AS srcCompany     ON srcCompany.id = br.srcCompanyId
      
              JOIN Stock              AS s                        ON s.companyId = srcCompany.id
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
      
             WHERE myCompany.id = ${companyId}
               AND srcCompany.managedById IS NULL
               AND w.isPublic = ${true}
               AND s.planId IS NULL
               ${companyConditionQuery}
               ${packagingQuery}
               ${paperTypeQuery}
               ${manufacturerQuery}
               ${minGrammageQuery}
               ${maxGrammageQuery}
               ${sizeXQuery}
               ${sizeYQuery}
      
             GROUP BY srcCompany.id
                      , s.packagingId
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
              HAVING availableQuantity != 0
      
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
          plan: null, // 거래처 재고는 도착예정재고 보이지 않음
          totalQuantity: Number(sg.totalQuantity),
          availableQuantity: Number(sg.availableQuantity),
          totalArrivalQuantity: 0,
          storingQuantity: 0,
          nonStoringQuantity: 0,
          lossRate: sg.lossRate === null ? null : Number(sg.lossRate),
          partnerCompanyRegistrationNumber: sg.partnerCompanyRegistrationNumber,
        };
      }),
      total,
    };
  }
}