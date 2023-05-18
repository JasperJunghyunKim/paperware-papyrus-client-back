import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { DiscountRateCondition, DiscountRateMap, DiscountRateMapType, PackagingType, PriceUnit } from "@prisma/client";
import { PrismaService } from "src/core";

type Bit = '0' | '1';
type DiscountRateConditionWithMap = DiscountRateCondition & { discountRateMap: DiscountRateMap[] }

export interface DiscountRate {
    discountRateMapType: DiscountRateMapType;
    discountRate: number;
    discountRateUnit: PriceUnit;
}

export class FisrtFiltered {
    constructor(
        private discountRateCondition: DiscountRateConditionWithMap,
        private accordanceBits: string,
        private count: number,
    ) { }

    getDiscountRateCondition = () => this.discountRateCondition;
    getBits = () => this.accordanceBits;
    getCount = () => this.count;

    isParentOf = (other: FisrtFiltered): boolean => {
        if (this.getCount() >= other.getCount()) return false;

        for (let i = 0; i < this.getBits().length; i++) {
            if (this.getBits()[i] === '1' && other.getBits()[i] !== '1')
                return false;
        }

        return true;
    };
}

interface ConditionId {
    discountRateConditionId: number;
}

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
                isDeleted: false,
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
                    isDeleted: false,
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

    async mapping(
        companyId: number,
        companyRegistrationNumber: string,
        isPurchase: boolean,
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
    ): Promise<DiscountRate[]> {
        const partner = await this.prisma.partner.findFirst({
            where: {
                companyId,
                companyRegistrationNumber,
                isDeleted: false,
            }
        });
        if (!partner) throw new BadRequestException(`존재하지 않는 거래처입니다.`);

        const conditionIds: ConditionId[] = await this.prisma.$queryRaw`
            SELECT drc.id AS discountRateConditionId
              FROM DiscountRateCondition            AS drc
              JOIN DiscountRateMap                  AS drm      ON drm.discountRateConditionId = drc.id 
                                                                AND drm.isPurchase = ${isPurchase} 
                                                                AND drm.isDeleted = ${false}

            WHERE drc.partnerId = ${partner.id}
              AND (drc.packagingType = ${packagingType} OR drc.packagingType IS NULL)
              AND (drc.paperDomainId = ${paperDomainId} OR drc.paperDomainId IS NULL)
              AND (drc.manufacturerId = ${manufacturerId} OR drc.manufacturerId IS NULL)
              AND (drc.paperGroupId = ${paperGroupId} OR drc.paperGroupId IS NULL)
              AND (drc.paperTypeId = ${paperTypeId} OR drc.paperTypeId IS NULL)
              AND (drc.grammage = ${grammage} OR drc.grammage IS NULL)
              AND (drc.sizeX = ${sizeX} OR drc.sizeX IS NULL)
              AND (drc.sizeY = ${sizeY} OR drc.sizeY IS NULL)
              AND (drc.paperColorGroupId = ${paperColorGroupId} OR drc.paperColorGroupId IS NULL)
              AND (drc.paperColorId = ${paperColorId} OR drc.paperColorId IS NULL)
              AND (drc.paperPatternId = ${paperPatternId} OR drc.paperPatternId IS NULL)
              AND (drc.paperCertId = ${paperCertId} OR drc.paperCertId IS NULL)
        `

        const conditions = await this.prisma.discountRateCondition.findMany({
            include: {
                discountRateMap: {
                    where: {
                        isPurchase,
                        isDeleted: false,
                    }
                }
            },
            where: {
                partnerId: partner.id,
                id: {
                    in: conditionIds.map(id => id.discountRateConditionId)
                }
            }
        });

        const firstFiltered = this.getFirstFiltering(
            conditions,
            packagingType,
            paperDomainId,
            manufacturerId,
            paperGroupId,
            paperTypeId,
            grammage,
            sizeX,
            sizeY,
            paperColorGroupId,
            paperColorId,
            paperPatternId,
            paperCertId,
        );
        console.log('[할인율 1st filtering]', firstFiltered.map(fisrt => ({ id: fisrt.getDiscountRateCondition().id, bits: fisrt.getBits() })));

        const conditionMap = new Map<number, DiscountRateConditionWithMap>();
        for (const first of firstFiltered) {
            conditionMap.set(first.getDiscountRateCondition().id, first.getDiscountRateCondition());
        }

        const graph = this.createGraph(firstFiltered);
        const leafNodeIds: number[] = [];
        for (const key of graph.keys()) {
            if (graph.get(key).length === 0) leafNodeIds.push(key);
        }

        return leafNodeIds.flatMap(id => {
            return conditionMap.get(id)
                .discountRateMap.map(map => ({
                    discountRateMapType: map.discountRateMapType,
                    discountRate: map.discountRate,
                    discountRateUnit: map.discountRateUnit,
                }));
        })
    }

    private getFirstFiltering(
        conditions: DiscountRateConditionWithMap[],
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
    ) {
        const firstFiltered: FisrtFiltered[] = [];
        for (const condition of conditions) {
            if (condition.discountRateMap.length === 0) continue;

            const packagingTypeBit = this.getAccordanceBit(condition.packagingType, packagingType);
            const paperDomainIdBit = this.getAccordanceBit(condition.paperDomainId, paperDomainId);
            const manufacturerIdBit = this.getAccordanceBit(condition.manufacturerId, manufacturerId);
            const paperGroupIdBit = this.getAccordanceBit(condition.paperGroupId, paperGroupId);
            const paperTypeIdBit = this.getAccordanceBit(condition.paperTypeId, paperTypeId);
            const grammageBit = this.getAccordanceBit(condition.grammage, grammage);
            const sizeXBit = this.getAccordanceBit(condition.sizeX, sizeX);
            const sizeYBit = this.getAccordanceBit(condition.sizeY, sizeY);
            const paperColorGroupIdBit = this.getAccordanceBit(condition.paperColorGroupId, paperColorGroupId);
            const paperColorIdBit = this.getAccordanceBit(condition.paperColorId, paperColorId);
            const paperPatternIdBit = this.getAccordanceBit(condition.paperPatternId, paperPatternId);
            const paperCertIdBit = this.getAccordanceBit(condition.paperCertId, paperCertId);

            const bits = [
                packagingTypeBit,
                paperDomainIdBit,
                manufacturerIdBit,
                paperGroupIdBit,
                paperTypeIdBit,
                grammageBit,
                sizeXBit,
                sizeYBit,
                paperColorGroupIdBit,
                paperColorIdBit,
                paperPatternIdBit,
                paperCertIdBit
            ];
            if (
                sizeXBit &&
                sizeYBit &&
                paperColorGroupIdBit &&
                paperColorIdBit &&
                paperPatternIdBit &&
                paperCertIdBit
            ) {
                firstFiltered.push(
                    new FisrtFiltered(
                        condition,
                        bits.join(""),
                        bits.filter(bit => bit === '1').length,
                    )
                );
            }
        }

        return firstFiltered;
    }

    private getAccordanceBit(conditionField: number | PackagingType | null, queryParam: number | PackagingType | null): Bit | null {
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

    private createGraph(firstFiltered: FisrtFiltered[]) {
        // 1의 갯수순으로 정렬
        firstFiltered.sort((a, b) => {
            return a.getCount() - b.getCount();
        });

        const graph = new Map<number, number[]>();
        for (const second of firstFiltered) {
            graph.set(second.getDiscountRateCondition().id, []);
        }

        for (let i = 0; i < firstFiltered.length - 1; i++) {
            for (let j = i + 1; j < firstFiltered.length; j++) {
                const a = firstFiltered[i];
                const b = firstFiltered[j];

                if (a.isParentOf(b))
                    graph.get(a.getDiscountRateCondition().id).push(b.getDiscountRateCondition().id)
            }
        }

        return graph;
    }
}