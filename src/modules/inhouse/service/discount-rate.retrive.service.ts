import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/core";

@Injectable()
export class DiscountRateRetriveService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

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