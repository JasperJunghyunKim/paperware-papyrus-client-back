import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DiscountRateType,
  DiscountRateUnit,
  PackagingType,
} from '@prisma/client';
import { PrismaService } from 'src/core';

interface DiscountRateDto {
  discountRate: number;
  discountRateUnit: DiscountRateUnit;
}

@Injectable()
export class DiscountRateChangeService {
  constructor(private readonly prisma: PrismaService) {}

  async createDiscountRate(
    companyId: number,
    discountRateType: DiscountRateType,
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
    await this.prisma.$transaction(async (tx) => {
      const condition =
        (await tx.discountRateCondition.findFirst({
          where: {
            companyId,
            partnerCompanyRegistrationNumber: companyRegistrationNumber,
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
          },
        })) ||
        (await tx.discountRateCondition.create({
          data: {
            companyId,
            partnerCompanyRegistrationNumber: companyRegistrationNumber,
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
          },
        }));

      const maps = await tx.discountRateMap.findMany({
        where: {
          discountRateConditionId: condition.id,
          discountRateType,
        },
      });
      if (maps.length === 0) {
        await tx.discountRateMap.createMany({
          data: [
            {
              discountRateConditionId: condition.id,
              discountRateMapType: 'BASIC',
              discountRateType,
              discountRate: basicDiscountRate.discountRate,
              discountRateUnit: basicDiscountRate.discountRateUnit,
            },
            {
              discountRateConditionId: condition.id,
              discountRateMapType: 'SPECIAL',
              discountRateType,
              discountRate: specialDiscountRate.discountRate,
              discountRateUnit: specialDiscountRate.discountRateUnit,
            },
          ],
        });
      } else {
        if (!maps[0].isDeleted)
          throw new ConflictException(`이미 존재하는 할인율조건 입니다.`);

        const basic =
          maps.find((map) => map.discountRateMapType === 'BASIC') || null;
        const special =
          maps.find((map) => map.discountRateMapType === 'SPECIAL') || null;

        await tx.discountRateMap.update({
          data: {
            discountRate: basicDiscountRate.discountRate,
            discountRateUnit: basicDiscountRate.discountRateUnit,
            isDeleted: false,
          },
          where: {
            id: basic.id,
          },
        });

        await tx.discountRateMap.update({
          data: {
            discountRate: specialDiscountRate.discountRate,
            discountRateUnit: specialDiscountRate.discountRateUnit,
            isDeleted: false,
          },
          where: {
            id: special.id,
          },
        });
      }
    });
  }

  async updateDiscountRate(
    companyId: number,
    discountRateType: DiscountRateType,
    discountRateConditionId: number,
    basicDiscountRate: DiscountRateDto,
    specialDiscountRate: DiscountRateDto,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const condition = await tx.discountRateCondition.findFirst({
        include: {
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
      if (!condition || condition.discountRateMap.length === 0) {
        throw new NotFoundException(`존재하지 않는 할인율 조건입니다.`);
      }

      const basic =
        condition.discountRateMap.find(
          (map) => map.discountRateMapType === 'BASIC',
        ) || null;
      const special =
        condition.discountRateMap.find(
          (map) => map.discountRateMapType === 'SPECIAL',
        ) || null;

      await tx.discountRateMap.update({
        data: {
          discountRate: basicDiscountRate.discountRate,
          discountRateUnit: basicDiscountRate.discountRateUnit,
        },
        where: {
          id: basic.id,
        },
      });
      await tx.discountRateMap.update({
        data: {
          discountRate: specialDiscountRate.discountRate,
          discountRateUnit: specialDiscountRate.discountRateUnit,
        },
        where: {
          id: special.id,
        },
      });
    });
  }

  async deleteDiscountRate(
    companyId: number,
    discountRateType: DiscountRateType,
    discountRateConditionId: number,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const condition = await tx.discountRateCondition.findFirst({
        include: {
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
      if (!condition || condition.discountRateMap.length === 0) {
        throw new NotFoundException(`존재하지 않는 할인율 조건입니다.`);
      }

      await tx.discountRateMap.updateMany({
        data: {
          isDeleted: true,
        },
        where: {
          id: {
            in: condition.discountRateMap.map((map) => map.id),
          },
        },
      });
    });
  }
}
