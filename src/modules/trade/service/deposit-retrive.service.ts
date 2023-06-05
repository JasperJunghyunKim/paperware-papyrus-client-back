import { Injectable, NotFoundException } from "@nestjs/common";
import { DepositType, PackagingType, Prisma } from "@prisma/client";
import { Model } from "src/@shared";
import { PrismaService } from "src/core";

export interface DepositFromDB {
    id: number;
    companyRegistrationNumber: string;
    partnerNickName: string;
    packagingId: number;
    packagingName: string;
    packagingType: PackagingType;
    packagingPackA: number;
    packagingPackB: number;
    productId: number;
    paperDomainId: number;
    paperDomainName: string;
    manufacturerId: number;
    manufacturerName: string;
    paperGroupId: number;
    paperGroupName: string;
    paperTypeId: number;
    paperTypeName: string;
    grammage: number;
    sizeX: number;
    sizeY: number;
    paperColorGroupId: number | null;
    paperColorGroupName: string | null;
    paperColorId: number | null;
    paperColorName: string | null;
    paperPatternId: number | null;
    paperPatternName: string | null;
    paperCertId: number | null;
    paperCertName: string | null;
    quantity: number;
    total: number;
}

@Injectable()
export class DepositRetriveService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    /** 보관량 조회 */
    async getDepositList(
        params: {
            companyId: number;
            skip: number;
            take: number;
            type: DepositType;
            companyRegistrationNumber: string | null;
        }
    ): Promise<{
        items: Model.Deposit[];
        total: number;
    }> {
        const {
            companyId,
            skip,
            take,
            type,
            companyRegistrationNumber,
        } = params;

        const companySearch = companyRegistrationNumber ? Prisma.sql`AND p.companyRegistrationNumber = ${companyRegistrationNumber}` : Prisma.empty;

        const result: DepositFromDB[] = await this.prisma.$queryRaw`
      SELECT d.id
            , p.companyRegistrationNumber
            , p.partnerNickName

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
            , d.grammage AS grammage
            , d.sizeX AS sizeX
            , d.sizeY AS sizeY
            , paperColorGroup.id AS paperColorGroupId
            , paperColorGroup.name AS paperColorGroupName
            , paperColor.id AS paperColorId
            , paperColor.name AS paperColorName
            , paperPattern.id AS paperPatternId
            , paperPattern.name AS paperPatternName
            , paperCert.id AS paperCertId
            , paperCert.name AS paperCertName

            -- 보관량
            , IFNULL(SUM(de.change), 0) AS quantity

            -- total
            , COUNT(1) OVER() AS total

        FROM Deposit            AS d
        JOIN DepositEvent       AS de               ON de.depositId = d.id
        JOIN Partner            AS p                ON p.id = d.partnerId

        JOIN Packaging          AS packaging        ON packaging.id = d.packagingId
        JOIN Product            AS product          ON product.id = d.productId
        JOIN PaperDomain        AS paperDomain      ON paperDomain.id = product.paperDomainId
        JOIN Manufacturer       AS manufacturer     ON manufacturer.id = product.manufacturerId
        JOIN PaperGroup         AS paperGroup       ON paperGroup.id = product.paperGroupId
        JOIN PaperType          AS paperType        ON paperType.id = product.paperTypeId
   LEFT JOIN PaperColorGroup    AS paperColorGroup  ON paperColorGroup.id = d.paperColorGroupId
   LEFT JOIN PaperColor         AS paperColor       ON paperColor.id = d.paperColorId
   LEFT JOIN PaperPattern       AS paperPattern     ON paperPattern.id = d.paperPatternId
   LEFT JOIN PaperCert          AS paperCert        ON paperCert.id = d.paperCertId

       WHERE p.companyId = ${companyId}
         AND d.depositType = ${type}
         ${companySearch}

       GROUP BY d.id

       LIMIT ${skip}, ${take}
    `;

        const total = result.length === 0 ? 0 : Number(result[0].total);

        return {
            items: result.map(deposit => ({
                id: deposit.id,
                companyRegistrationNumber: deposit.companyRegistrationNumber,
                partnerNickName: deposit.partnerNickName,
                packaging: {
                    id: deposit.packagingId,
                    type: deposit.packagingType,
                    packA: deposit.packagingPackA,
                    packB: deposit.packagingPackB,
                },
                product: {
                    id: deposit.productId,
                    paperDomain: {
                        id: deposit.paperDomainId,
                        name: deposit.paperDomainName,
                    },
                    paperGroup: {
                        id: deposit.paperGroupId,
                        name: deposit.paperGroupName,
                    },
                    manufacturer: {
                        id: deposit.manufacturerId,
                        name: deposit.manufacturerName,
                    },
                    paperType: {
                        id: deposit.paperTypeId,
                        name: deposit.paperTypeName,
                    },
                },
                grammage: deposit.grammage,
                sizeX: deposit.sizeX,
                sizeY: deposit.sizeY,
                paperColorGroup: deposit.paperColorGroupId ? {
                    id: deposit.paperColorGroupId,
                    name: deposit.paperColorGroupName,
                } : null,
                paperColor: deposit.paperColorId ? {
                    id: deposit.paperColorId,
                    name: deposit.paperColorName,
                } : null,
                paperPattern: deposit.paperPatternId ? {
                    id: deposit.paperPatternId,
                    name: deposit.paperPatternName,
                } : null,
                paperCert: deposit.paperCertId ? {
                    id: deposit.paperCertId,
                    name: deposit.paperCertName,
                } : null,
                quantity: Number(deposit.quantity),
            })),
            total,
        };
    }

    /** 보관량 상세조회 */
    async getDepositHistory(
        id: number,
        companyId: number,
    ): Promise<Model.DepositEvent[]> {
        const deposit = await this.prisma.deposit.findUnique({
            include: {
                partner: true,
                depositEvents: {
                    include: {
                        orderDeposit: {
                            include: {
                                order: true,
                            }
                        },
                    }
                },
            },
            where: {
                id,
            }
        });

        if (!deposit || deposit.partner.companyId !== companyId) throw new NotFoundException(`등록되지 않은 보관입니다.`);

        return deposit.depositEvents.map(e => ({
            id: e.id,
            change: e.change,
            createdAt: e.createdAt.toISOString(),
            memo: e.memo,
        }));
    }
}