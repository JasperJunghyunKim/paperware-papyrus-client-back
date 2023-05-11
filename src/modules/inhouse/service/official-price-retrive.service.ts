import { Injectable } from "@nestjs/common";
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
}