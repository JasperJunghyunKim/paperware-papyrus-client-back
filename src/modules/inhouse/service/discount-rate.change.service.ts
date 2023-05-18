import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PackagingType, PriceUnit } from "@prisma/client";
import { PrismaService } from "src/core";

interface DiscountRateDto {
    discountRate: number;
    discountRateUnit: PriceUnit;
}

@Injectable()
export class DiscountRateChangeService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async createDiscountRate(
        companyId: number,
        isPurchase: boolean,
        companyRegistrationNumber: string,
        packagingType: PackagingType,
        paperDomainId: number,
        manufacturerId: number,
        paperGroupId: number,
        paperTypeId: number,
        grammage: number,
        sizeX: number,
        sizeY: number,
        paperColorGroupId: number,
        paperColorId: number,
        paperPatternId: number,
        paperCertId: number,
        basicDiscountRate: DiscountRateDto,
        specialDiscountRate: DiscountRateDto,
    ) {
        await this.prisma.$transaction(async tx => {
            const condition = await tx.discountRateCondition.findFirst({
                where: {
                    packagingType: packagingType || null,
                    paperDomainId: paperDomainId || null,
                    manufacturerId: manufacturerId || null,
                    paperGroupId: paperGroupId || null,
                    paperTypeId: paperTypeId || null,
                    grammage: grammage || null,
                    sizeX: sizeX || null,
                    sizeY: sizeY || null,
                    paperColorGroupId: paperColorGroupId || null,
                    paperColorId: paperColorId || null,
                    paperPatternId: paperPatternId || null,
                    paperCertId: paperCertId || null,
                }
            }) || await tx.discountRateCondition.create({
                data: {
                    packagingType: packagingType || null,
                    paperDomainId: paperDomainId || null,
                    manufacturerId: manufacturerId || null,
                    paperGroupId: paperGroupId || null,
                    paperTypeId: paperTypeId || null,
                    grammage: grammage || null,
                    sizeX: sizeX || null,
                    sizeY: sizeY || null,
                    paperColorGroupId: paperColorGroupId || null,
                    paperColorId: paperColorId || null,
                    paperPatternId: paperPatternId || null,
                    paperCertId: paperCertId || null,
                }
            });

            const partner = await tx.partner.findFirst({
                where: {
                    companyId,
                    companyRegistrationNumber,
                }
            });
            if (!partner) throw new NotFoundException(`존재하지 않는 거래처입니다`);

            const maps = await tx.discountRateMap.findMany({
                where: {
                    discountRateConditionId: condition.id,
                    partnerId: partner.id,
                    isPurchase,
                }
            });
            if (maps.length === 0) {
                await tx.discountRateMap.createMany({
                    data: [
                        {
                            partnerId: partner.id,
                            discountRateConditionId: condition.id,
                            discountRateMapType: 'BASIC',
                            isPurchase,
                            discountRate: basicDiscountRate.discountRate,
                            discountRateUnit: basicDiscountRate.discountRateUnit,
                        },
                        {
                            partnerId: partner.id,
                            discountRateConditionId: condition.id,
                            discountRateMapType: 'SPECIAL',
                            isPurchase,
                            discountRate: specialDiscountRate.discountRate,
                            discountRateUnit: specialDiscountRate.discountRateUnit,
                        },
                    ]
                });
            } else {
                if (!maps[0].isDeleted) throw new ConflictException(`이미 존재하는 할인율조건 입니다.`);

                const basic = maps.find(map => map.discountRateMapType === 'BASIC') || null;
                const special = maps.find(map => map.discountRateMapType === 'SPECIAL') || null;

                await tx.discountRateMap.update({
                    data: {
                        discountRate: basicDiscountRate.discountRate,
                        discountRateUnit: basicDiscountRate.discountRateUnit,
                    },
                    where: {
                        id: basic.id
                    }
                });

                await tx.discountRateMap.update({
                    data: {
                        discountRate: specialDiscountRate.discountRate,
                        discountRateUnit: specialDiscountRate.discountRateUnit,
                    },
                    where: {
                        id: special.id
                    }
                });
            }
        });
    }
}