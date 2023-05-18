import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/core";

export interface DiscountRateClient {
    partnerId: number;
    companyId: number;
    companyRegistrationNumber: string;
    partnerNickName: string;
    partnerMemo: string;
    discountRateConditionId: number;
    discountRateCount: number;
    total: number;
}

@Injectable()
export class DiscountRateRetriveService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async getClientList(
        companyId: number,
        isPurchase: boolean,
        skip: number,
        take: number,
    ) {
        const result: DiscountRateClient[] = await this.prisma.$queryRaw`
            SELECT p.id AS partnerId
                    , p.companyId AS companyId
                    , p.companyRegistrationNumber AS companyRegistrationNumber
                    , p.partnerNickName AS paertnerNickName
                    , p.memo AS partnerMemo
                    , drc.id AS discountRateConditionId
                    , (IFNULL(COUNT(CASE WHEN drm.id IS NOT NULL THEN 1 END), 0) / 2) AS discountRateCount

                    , COUNT(1) OVER() AS total

              FROM Partner                  AS p
              
              JOIN DiscountRateCondition    AS drc      ON drc.partnerId = p.id
         LEFT JOIN discountRateMap          AS drm      ON drm.discountRateConditionId = drc.id 
                                                        AND drm.isDeleted = ${false} 
                                                        AND drm.isPurchase = ${isPurchase}
             WHERE p.isDeleted = ${false}
               AND p.companyId = ${companyId}

            LIMIT ${skip}, ${take}
        `;

        const total = result.length === 0 ? 0 : Number(result[0].total);
        for (const data of result) {
            data.discountRateCount = Number(data.discountRateCount);
            data.total = Number(data.total);
        }

        return { result, total };
    }

    async getList(
        companyId: number,
        isPurchase: boolean,
        companyRegistrationNumber: string,
        skip: number,
        take: number,
    ) {
        const partner = await this.prisma.partner.findFirst({
            where: {
                companyId,
                companyRegistrationNumber,
            }
        });
        if (!partner) throw new BadRequestException(`존재하지 않는 거래처입니다.`);

        const conditionIds = await this.prisma.discountRateMap.findMany({
            select: {
                discountRateConditionId: true,
            },
            where: {
                isPurchase,
                isDeleted: false,
                discountRateCondition: {
                    partnerId: partner.id,
                }
            },
            skip: skip * 2,
            take: take * 2,
        });
        const total = await this.prisma.discountRateMap.count({
            where: {
                isPurchase,
                isDeleted: false,
            },
        });

        const conditions = await this.prisma.discountRateCondition.findMany({
            include: {
                paperDomain: true,
                manufacturer: true,
                paperGroup: true,
                paperType: true,
                paperColorGroup: true,
                paperColor: true,
                paperPattern: true,
                paperCert: true,
                discountRateMap: {
                    select: {
                        discountRateMapType: true,
                        discountRate: true,
                        discountRateUnit: true,
                    },
                    where: {
                        isPurchase,
                        isDeleted: false,
                    }
                },
            },
            where: {
                id: {
                    in: conditionIds.map(id => id.discountRateConditionId)
                }
            }
        });

        for (const condition of conditions) {
            delete condition.paperDomainId;
            delete condition.manufacturerId;
            delete condition.paperGroupId;
            delete condition.paperTypeId;
            delete condition.paperColorGroupId;
            delete condition.paperColorId;
            delete condition.paperPatternId;
            delete condition.paperCertId;
        }

        return { conditions, total: total / 2 };
    }

    async get(
        companyId: number,
        isPurchase: boolean,
        discountRateConditionId: number,
    ) {
        const condition = await this.prisma.discountRateCondition.findFirst({
            include: {
                partner: true,
                paperDomain: true,
                manufacturer: true,
                paperGroup: true,
                paperType: true,
                paperColorGroup: true,
                paperColor: true,
                paperPattern: true,
                paperCert: true,
                discountRateMap: {
                    where: {
                        isPurchase,
                        isDeleted: false,
                    }
                }
            },
            where: {
                id: discountRateConditionId,
                partner: {
                    companyId,
                }
            }
        });
        if (!condition || !condition.partner || condition.discountRateMap.length === 0) {
            throw new NotFoundException(`존재하지 않는 할인율 조건입니다.`);
        }

        delete condition.paperDomainId;
        delete condition.manufacturerId;
        delete condition.paperGroupId;
        delete condition.paperTypeId;
        delete condition.paperColorGroupId;
        delete condition.paperColorId;
        delete condition.paperPatternId;
        delete condition.paperCertId;
        delete condition.partner;

        return condition;
    }
}