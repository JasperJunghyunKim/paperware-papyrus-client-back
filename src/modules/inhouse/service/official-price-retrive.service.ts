import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { OfficialPriceCondition, OfficialPriceMap } from "@prisma/client";
import { PrismaService } from "src/core";

type Bit = '0' | '1';

class SecondFiltered {
    constructor(
        private officialPriceConditionId: number,
        private accordanceBits: string,
        private count: number,
    ) { }

    getOfficialPriceConditionId = () => this.officialPriceConditionId;
    getBits = () => this.accordanceBits;
    getCount = () => this.count;

    isParentOf = (other: SecondFiltered): boolean => {
        if (this.getCount() >= other.getCount()) return false;

        for (let i = 0; i < this.getBits().length; i++) {
            if (this.getBits()[i] === '1' && other.getBits()[i] !== '1')
                return false;
        }

        return true;
    };
}

type OfficialPriceWithMap = OfficialPriceCondition & {
    officialPriceMap: OfficialPriceMap[];
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
    ): Promise<OfficialPriceMap[]> {
        const firstFiltered = await this.getFirstFiltering(companyId, productId, grammage);
        const secondFiltred = this.getSecondFiltering(
            firstFiltered,
            sizeX,
            sizeY,
            paperColorGroupId,
            paperColorId,
            paperPatternId,
            paperCertId,
        );
        console.log(`[second filterd]`, secondFiltred);
        const graph = this.createGraph(secondFiltred);
        console.log(`[graph]`, graph);

        const leafNodeIds = this.getLeafNodeIds(graph);
        if (leafNodeIds.length === 1) {
            const target = firstFiltered.find(fisrt => fisrt.id === leafNodeIds[0]);
            return target.officialPriceMap;
        }

        return [];
    }

    private async getFirstFiltering(
        companyId: number,
        productId: number,
        grammage: number,
    ): Promise<OfficialPriceWithMap[]> {
        const conditions = await this.prisma.officialPriceCondition.findMany({
            include: {
                officialPriceMap: true,
            },
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

    private getSecondFiltering(
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


            const bits = [sizeXBit, sizeYBit, paperColorGroupIdBit, paperColorIdBit, paperPatternIdBit, paperCertIdBit];
            if (
                sizeXBit &&
                sizeYBit &&
                paperColorGroupIdBit &&
                paperColorIdBit &&
                paperPatternIdBit &&
                paperCertIdBit
            ) {
                secondFiltered.push(
                    new SecondFiltered(
                        first.id,
                        bits.join(""),
                        bits.filter(bit => bit === '1').length,
                    )
                );
            }
        }

        return secondFiltered;
    }

    private getAccordanceBit(conditionField: number | null, queryParam: number | null): Bit | null {
        // 3, 5 조건 걸러내기
        if (
            (conditionField && !queryParam) ||
            (conditionField && queryParam && (conditionField !== queryParam))
        ) return null;

        // 고시가 조건이 없으면 0
        if (!conditionField) return '0';
        // 고시가조건 존재하고 쿼리와 같으면 1
        else if (conditionField && queryParam && conditionField === queryParam) return '1';

        return null;
    }

    private createGraph(secondFiltered: SecondFiltered[]) {
        // 1의 갯수순으로 정렬
        secondFiltered.sort((a, b) => {
            return a.getCount() - b.getCount();
        });

        const graph = new Map<number, number[]>();
        for (const second of secondFiltered) {
            graph.set(second.getOfficialPriceConditionId(), []);
        }

        for (let i = 0; i < secondFiltered.length - 1; i++) {
            for (let j = i + 1; j < secondFiltered.length; j++) {
                const a = secondFiltered[i];
                const b = secondFiltered[j];

                if (a.isParentOf(b))
                    graph.get(a.getOfficialPriceConditionId()).push(b.getOfficialPriceConditionId())
            }
        }

        return graph;
    }

    private getLeafNodeIds(graph: Map<number, number[]>): number[] {
        const leafNodeIds: number[] = [];

        for (const key of graph.keys()) {
            if (graph.get(key).length === 0) leafNodeIds.push(key);
        }

        return leafNodeIds;
    }
}