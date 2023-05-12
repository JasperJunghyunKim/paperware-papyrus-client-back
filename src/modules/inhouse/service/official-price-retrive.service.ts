import { Injectable, NotFoundException } from "@nestjs/common";
import { OfficialPriceCondition, OfficialPriceMap } from "@prisma/client";
import { PrismaService } from "src/core";

interface SecondFiltered {
    officialPriceConditionId: number;
    accordanceBits: string;
}

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

    async getMapping(
        companyId: number,
        productId: number,
        grammage: number,
        sizeX: number,
        sizeY: number,
        paperColorGroupId: number,
        paperColorId: number,
        paperPatternId: number,
        paperCertId: number,
    ) {
        const firstFiltered = await this.getFirstFiltering(companyId, productId, grammage);
        const secondFiltred = await this.getSecondFiltering(
            firstFiltered,
            sizeX,
            sizeY,
            paperColorGroupId,
            paperColorId,
            paperPatternId,
            paperCertId,
        );
    }

    private async getFirstFiltering(
        companyId: number,
        productId: number,
        grammage: number,
    ): Promise<OfficialPriceCondition[]> {
        const conditions = await this.prisma.officialPriceCondition.findMany({
            where: {
                productId,
                grammage,
                officialPriceMap: {
                    some: {
                        companyId,
                        isDeleted: false,
                    }
                }
            }
        });

        return conditions;
    }

    private async getSecondFiltering(
        firstFiltered: OfficialPriceCondition[],
        sizeX: number,
        sizeY: number,
        paperColorGroupId: number,
        paperColorId: number,
        paperPatternId: number,
        paperCertId: number,
    ) {
        const secondFiltered: SecondFiltered[] = [];

        for (const first of firstFiltered) {
            const sizeXBit = this.getAccordanceBit(first.sizeX, sizeX);
            const sizeYBit = this.getAccordanceBit(first.sizeY, sizeY);
            const paperColorGroupIdBit = this.getAccordanceBit(first.paperColorGroupId, paperColorGroupId);
            const paperColorIdBit = this.getAccordanceBit(first.paperColorId, paperColorId);
            const paperPatternIdBit = this.getAccordanceBit(first.paperPatternId, paperPatternId);
            const paperCertIdBit = this.getAccordanceBit(first.paperCertId, paperCertId);



        }
    }

    private getAccordanceBit(conditionField: number | null, queryParam: number | null) {

    }
}