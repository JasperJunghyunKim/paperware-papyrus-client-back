import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DiscountRateCondition,
  DiscountRateMap,
  DiscountRateMapType,
  DiscountRateType,
  DiscountRateUnit,
  Manufacturer,
  PackagingType,
  PaperCert,
  PaperColor,
  PaperColorGroup,
  PaperDomain,
  PaperGroup,
  PaperPattern,
  PaperType,
  Prisma,
} from '@prisma/client';
import { Model } from 'src/@shared';
import { DiscountRateListResponse } from 'src/@shared/api/inhouse/discount-rate.response';
import {
  MANUFACTURER,
  PAPER_CERT,
  PAPER_COLOR,
  PAPER_COLOR_GROUP,
  PAPER_DOMAIN,
  PAPER_GROUP,
  PAPER_PATTERN,
  PAPER_TYPE,
} from 'src/common/selector';
import { PrismaService } from 'src/core';

type Bit = '0' | '1';
type DiscountRateConditionWithMap = DiscountRateCondition & {
  packagingType: PackagingType | null;
  paperDomain: PaperDomain | null;
  manufacturer: Manufacturer | null;
  paperGroup: PaperGroup | null;
  paperType: PaperType | null;
  grammage: number | null;
  sizeX: number | null;
  sizeY: number | null;
  paperColorGroup: PaperColorGroup | null;
  paperColor: PaperColor | null;
  paperPattern: PaperPattern | null;
  paperCert: PaperCert | null;
  discountRateMap: DiscountRateMap[];
};

export interface DiscountRate {
  discountRateCondition: {
    packagingType: PackagingType | null;
    paperDomain: PaperDomain | null;
    manufacturer: Manufacturer | null;
    paperGroup: PaperGroup | null;
    paperType: PaperType | null;
    grammage: number | null;
    sizeX: number | null;
    sizeY: number | null;
    paperColorGroup: PaperColorGroup | null;
    paperColor: PaperColor | null;
    paperPattern: PaperPattern | null;
    paperCert: PaperCert | null;
  };
  discountRateMapType: DiscountRateMapType;
  discountRate: number;
  discountRateUnit: DiscountRateUnit;
}

export class FisrtFiltered {
  constructor(
    private discountRateCondition: DiscountRateConditionWithMap,
    private accordanceBits: string,
    private count: number,
  ) {}

  getDiscountRateCondition = () => this.discountRateCondition;
  getBits = () => this.accordanceBits;
  getCount = () => this.count;

  isParentOf = (other: FisrtFiltered): boolean => {
    if (this.getCount() >= other.getCount()) return false;

    for (let i = 0; i < this.getBits().length; i++) {
      if (this.getBits()[i] === '1' && other.getBits()[i] !== '1') return false;
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
  creditLimit: number;
  discountRateConditionId: number;
  discountRateCount: number;
  total: number;
}

@Injectable()
export class DiscountRateRetriveService {
  constructor(private readonly prisma: PrismaService) {}

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
                    , p.creditLimit AS creditLimit
                    , p.memo AS partnerMemo
                    , drc.id AS discountRateConditionId
                    , (IFNULL(COUNT(CASE WHEN drm.id IS NOT NULL THEN 1 END), 0) / 2) AS discountRateCount

                    , COUNT(1) OVER() AS total

              FROM Partner                  AS p

         LEFT JOIN DiscountRateCondition    AS drc      ON drc.partnerId = p.id
         LEFT JOIN DiscountRateMap          AS drm      ON drm.discountRateConditionId = drc.id
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
    discountRateType: DiscountRateType,
    companyRegistrationNumber: string | null,
    skip: number,
    take: number,
  ): Promise<DiscountRateListResponse> {
    const registrationNumberCondition = companyRegistrationNumber
      ? Prisma.sql`AND drc.partnerCompanyRegistrationNumber = ${companyRegistrationNumber}`
      : Prisma.empty;

    const ids: {
      id: number;
      partnerCompanyRegistrationNumber: string;
      total: bigint;
    }[] = await this.prisma.$queryRaw`
      SELECT drc.id AS id, drc.partnerCompanyRegistrationNumber AS partnerCompanyRegistrationNumber, COUNT(1) OVER() AS total

        FROM DiscountRateCondition      AS drc
        JOIN DiscountRateMap            AS drm    ON drm.discountRateConditionId = drc.id AND drm.discountRateType = ${discountRateType} AND drm.isDeleted = ${false}
       WHERE drc.companyId = ${companyId}
        ${registrationNumberCondition}

      LIMIT ${skip * 2}, ${take * 2}
    `;

    const total = ids.length === 0 ? 0 : Number(ids[0].total) / 2;
    const items =
      ids.length === 0
        ? []
        : await this.prisma.discountRateCondition.findMany({
            include: {
              paperDomain: {
                select: PAPER_DOMAIN,
              },
              manufacturer: {
                select: MANUFACTURER,
              },
              paperGroup: {
                select: PAPER_GROUP,
              },
              paperType: {
                select: PAPER_TYPE,
              },
              paperColorGroup: {
                select: PAPER_COLOR_GROUP,
              },
              paperColor: {
                select: PAPER_COLOR,
              },
              paperPattern: {
                select: PAPER_PATTERN,
              },
              paperCert: {
                select: PAPER_CERT,
              },
              discountRateMap: {
                select: {
                  discountRateMapType: true,
                  discountRate: true,
                  discountRateUnit: true,
                },
                where: {
                  discountRateType,
                },
              },
            },
            where: {
              id: {
                in: ids.map((id) => id.id),
              },
            },
          });

    const partnerCompanyRegistrationNumbers = Array.from(
      new Set(ids.map((id) => id.partnerCompanyRegistrationNumber)),
    );

    const partnerMap = new Map<string, Model.Partner>();
    const partners: {
      companyRegistrationNumber: string;
      partnerNickName: string;
      memo: string;
    }[] =
      ids.length === 0
        ? []
        : await this.prisma.$queryRaw`
      SELECT companyRegistrationNumber, partnerNickName, memo
        FROM Partner
       WHERE companyId = ${companyId}
         AND companyRegistrationNumber IN (${Prisma.join(
           partnerCompanyRegistrationNumbers,
         )})
    `;
    const companies: {
      id: number;
      companyRegistrationNumber: string;
      businessName: string;
    }[] =
      ids.length === 0
        ? []
        : await this.prisma.$queryRaw`
      SELECT id, companyRegistrationNumber, businessName, ROW_NUMBER() OVER(PARTITION BY companyRegistrationNumber ORDER BY id DESC)
        FROM Company
       WHERE companyRegistrationNumber IN (${Prisma.join(
         partnerCompanyRegistrationNumbers,
       )})
    `;
    for (const company of companies) {
      partnerMap.set(company.companyRegistrationNumber, {
        companyId: company.id,
        companyRegistrationNumber: company.companyRegistrationNumber,
        partnerNickName: company.businessName,
        creditLimit: 0,
        memo: '',
      });
    }
    for (const partner of partners) {
      const partnerData = partnerMap.get(partner.companyRegistrationNumber);
      if (!partnerData) continue;
      partnerData.partnerNickName = partner.partnerNickName;
      partnerData.memo = partner.memo;
      partnerMap.set(partner.companyRegistrationNumber, partnerData);
    }

    return {
      items: items.map((item) => {
        const basicDiscountRate = item.discountRateMap.find(
          (map) => map.discountRateMapType === 'BASIC',
        );
        const specialDiscountRate = item.discountRateMap.find(
          (map) => map.discountRateMapType === 'SPECIAL',
        );

        return {
          id: item.id,
          partner:
            partnerMap.get(item.partnerCompanyRegistrationNumber) || null,
          packagingType: item.packagingType,
          paperDomain: item.paperDomain,
          manufacturer: item.manufacturer,
          paperGroup: item.paperGroup,
          paperType: item.paperType,
          grammage: item.grammage,
          sizeX: item.sizeX,
          sizeY: item.sizeY,
          paperColorGroup: item.paperColorGroup,
          paperColor: item.paperColor,
          paperPattern: item.paperPattern,
          paperCert: item.paperCert,
          basicDiscountRate: {
            discountRate: basicDiscountRate.discountRate,
            discountRateUnit: basicDiscountRate.discountRateUnit,
          },
          specialDiscountRate: {
            discountRate: specialDiscountRate.discountRate,
            discountRateUnit: specialDiscountRate.discountRateUnit,
          },
        };
      }),
      total,
    };
  }

  async get(
    companyId: number,
    discountRateType: DiscountRateType,
    discountRateConditionId: number,
  ): Promise<Model.DiscountRateCondition> {
    const condition = await this.prisma.discountRateCondition.findFirst({
      include: {
        paperDomain: {
          select: PAPER_DOMAIN,
        },
        manufacturer: {
          select: MANUFACTURER,
        },
        paperGroup: {
          select: PAPER_GROUP,
        },
        paperType: {
          select: PAPER_TYPE,
        },
        paperColorGroup: {
          select: PAPER_COLOR_GROUP,
        },
        paperColor: {
          select: PAPER_COLOR,
        },
        paperPattern: {
          select: PAPER_PATTERN,
        },
        paperCert: {
          select: PAPER_CERT,
        },
        discountRateMap: {
          where: {
            discountRateType,
            isDeleted: false,
          },
        },
      },
      where: {
        id: discountRateConditionId,
        companyId,
      },
    });
    if (!condition || condition.discountRateMap.length === 0)
      throw new NotFoundException(`존재하지 않는 할인율입니다.`);

    const partner =
      (await this.prisma.partner.findUnique({
        include: {
          partnerTaxManager: true,
        },
        where: {
          companyId_companyRegistrationNumber: {
            companyId,
            companyRegistrationNumber:
              condition.partnerCompanyRegistrationNumber,
          },
        },
      })) || null;
    const partnerCompany = await this.prisma.company.findFirst({
      where: {
        companyRegistrationNumber: condition.partnerCompanyRegistrationNumber,
      },
      orderBy: {
        id: 'desc',
      },
    });

    const basicDiscountRate = condition.discountRateMap.find(
      (map) => map.discountRateMapType === 'BASIC',
    );
    const specialDiscountRate = condition.discountRateMap.find(
      (map) => map.discountRateMapType === 'SPECIAL',
    );

    return {
      id: condition.id,
      partner: {
        companyId: partnerCompany.id,
        companyRegistrationNumber: partnerCompany.companyRegistrationNumber,
        partnerNickName: partner
          ? partner.partnerNickName
          : partnerCompany.businessName,
        creditLimit: partner.creditLimit,
        memo: partner ? partner.memo : '',
      },
      packagingType: condition.packagingType,
      paperDomain: condition.paperDomain,
      manufacturer: condition.manufacturer,
      paperGroup: condition.paperGroup,
      paperType: condition.paperType,
      grammage: condition.grammage,
      sizeX: condition.sizeX,
      sizeY: condition.sizeY,
      paperColorGroup: condition.paperColorGroup,
      paperColor: condition.paperColor,
      paperPattern: condition.paperPattern,
      paperCert: condition.paperCert,
      basicDiscountRate: {
        discountRate: basicDiscountRate.discountRate,
        discountRateUnit: basicDiscountRate.discountRateUnit,
      },
      specialDiscountRate: {
        discountRate: specialDiscountRate.discountRate,
        discountRateUnit: specialDiscountRate.discountRateUnit,
      },
    };
  }

  async mapping(
    companyId: number,
    companyRegistrationNumber: string,
    discountRateType: DiscountRateType,
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
      },
    });
    if (!partner) throw new BadRequestException(`존재하지 않는 거래처입니다.`);

    const conditionIds: ConditionId[] = await this.prisma.$queryRaw`
            SELECT drc.id AS discountRateConditionId
              FROM DiscountRateCondition            AS drc
              JOIN DiscountRateMap                  AS drm      ON drm.discountRateConditionId = drc.id
                                                                AND drm.discountRateType = ${discountRateType}
                                                                AND drm.isDeleted = ${false}

            WHERE drc.companyId = ${companyId}
              AND drc.partnerCompanyRegistrationNumber = ${companyRegistrationNumber}
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
        `;

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
          where: {
            discountRateType,
            isDeleted: false,
          },
        },
      },
      where: {
        companyId,
        partnerCompanyRegistrationNumber: companyRegistrationNumber,
        id: {
          in: conditionIds.map((id) => id.discountRateConditionId),
        },
      },
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
    console.log(
      '[할인율 1st filtering]',
      firstFiltered.map((fisrt) => ({
        id: fisrt.getDiscountRateCondition().id,
        bits: fisrt.getBits(),
      })),
    );

    const conditionMap = new Map<number, DiscountRateConditionWithMap>();
    for (const first of firstFiltered) {
      conditionMap.set(
        first.getDiscountRateCondition().id,
        first.getDiscountRateCondition(),
      );
    }

    const graph = this.createGraph(firstFiltered);
    const leafNodeIds: number[] = [];
    for (const key of graph.keys()) {
      if (graph.get(key).length === 0) leafNodeIds.push(key);
    }

    return leafNodeIds.flatMap((id) => {
      const condition = conditionMap.get(id);
      return condition.discountRateMap.map((map) => ({
        discountRateCondition: {
          packagingType: condition.packagingType,
          paperDomain: condition.paperDomain,
          manufacturer: condition.manufacturer,
          paperGroup: condition.paperGroup,
          paperType: condition.paperType,
          grammage: condition.grammage,
          sizeX: condition.sizeX,
          sizeY: condition.sizeY,
          paperColorGroup: condition.paperColorGroup,
          paperColor: condition.paperColor,
          paperPattern: condition.paperPattern,
          paperCert: condition.paperCert,
        },
        discountRateMapType: map.discountRateMapType,
        discountRate: map.discountRate,
        discountRateUnit: map.discountRateUnit,
      }));
    });
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

      const packagingTypeBit = this.getAccordanceBit(
        condition.packagingType,
        packagingType,
      );
      const paperDomainIdBit = this.getAccordanceBit(
        condition.paperDomainId,
        paperDomainId,
      );
      const manufacturerIdBit = this.getAccordanceBit(
        condition.manufacturerId,
        manufacturerId,
      );
      const paperGroupIdBit = this.getAccordanceBit(
        condition.paperGroupId,
        paperGroupId,
      );
      const paperTypeIdBit = this.getAccordanceBit(
        condition.paperTypeId,
        paperTypeId,
      );
      const grammageBit = this.getAccordanceBit(condition.grammage, grammage);
      const sizeXBit = this.getAccordanceBit(condition.sizeX, sizeX);
      const sizeYBit = this.getAccordanceBit(condition.sizeY, sizeY);
      const paperColorGroupIdBit = this.getAccordanceBit(
        condition.paperColorGroupId,
        paperColorGroupId,
      );
      const paperColorIdBit = this.getAccordanceBit(
        condition.paperColorId,
        paperColorId,
      );
      const paperPatternIdBit = this.getAccordanceBit(
        condition.paperPatternId,
        paperPatternId,
      );
      const paperCertIdBit = this.getAccordanceBit(
        condition.paperCertId,
        paperCertId,
      );

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
        paperCertIdBit,
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
            bits.join(''),
            bits.filter((bit) => bit === '1').length,
          ),
        );
      }
    }

    return firstFiltered;
  }

  private getAccordanceBit(
    conditionField: number | PackagingType | null,
    queryParam: number | PackagingType | null,
  ): Bit | null {
    // 3, 5 조건 걸러내기
    if (
      (conditionField && !queryParam) ||
      (conditionField && queryParam && conditionField !== queryParam)
    )
      return null;

    // 고시가 조건이 없으면 0
    if (!conditionField) return '0';
    // 고시가조건 존재하고 쿼리와 같으면 1
    else if (conditionField && queryParam && conditionField === queryParam)
      return '1';

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
          graph
            .get(a.getDiscountRateCondition().id)
            .push(b.getDiscountRateCondition().id);
      }
    }

    return graph;
  }
}
