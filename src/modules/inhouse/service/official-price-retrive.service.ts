import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/core";

@Injectable()
export class OfficialPriceRetriveService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async getList(companyId: number, skip: number, take: number) {
        const [officialPrices, total] = await this.prisma.$transaction([
            this.prisma.officialPriceCondition.findMany({
                include: {
                    officialPriceMap: true,
                    product: {
                        include: {
                            paperDomain: true,
                            manufacturer: true,
                            paperGroup: true,
                            paperType: true,
                        },
                    },
                    paperColorGroup: true,
                    paperColor: true,
                    paperPattern: true,
                    paperCert: true,
                },
                where: {
                    officialPriceMap: {
                        some: {
                            companyId,
                            isDeleted: false,
                        }
                    }
                },
                skip,
                take,
            }),
            this.prisma.officialPriceCondition.count({
                where: {
                    officialPriceMap: {
                        some: {
                            companyId,
                            isDeleted: false,
                        }
                    }
                },
            }),
        ]);


        return { officialPrices, total };
    }

    async get(companyId: number, officialPriceConditionId: number) {
        const officialPrice = await this.prisma.officialPriceCondition.findFirst({
            include: {
                officialPriceMap: true,
                product: {
                    include: {
                        paperDomain: true,
                        manufacturer: true,
                        paperGroup: true,
                        paperType: true,
                    },
                },
                paperColorGroup: true,
                paperColor: true,
                paperPattern: true,
                paperCert: true,
            },
            where: {
                id: officialPriceConditionId,
                officialPriceMap: {
                    some: {
                        companyId,
                        isDeleted: false,
                    }
                }
            },
        });
        if (!officialPrice) throw new NotFoundException(`존재하지 않는 고시가 입니다.`);

        return officialPrice;
    }
}