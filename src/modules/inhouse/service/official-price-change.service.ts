import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PriceUnit } from 'src/@shared/models/enum';
import { PrismaService } from 'src/core';
import { OfficialPriceCondition } from '@prisma/client';

interface OfficialPrice {
  officialPrice: number;
  officialPriceUnit: PriceUnit;
}

@Injectable()
export class OfficialPriceChangeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    companyId: number,
    productId: number,
    grammage: number,
    sizeX: number,
    sizeY: number,
    paperColorGroupId: number | null,
    paperColorId: number | null,
    paperPatternId: number | null,
    paperCertId: number | null,
    wholesalePrice: OfficialPrice,
    retailPrice: OfficialPrice,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const condition: OfficialPriceCondition =
        (await tx.officialPriceCondition.findFirst({
          where: {
            productId,
            grammage,
            sizeX,
            sizeY,
            paperColorGroupId,
            paperColorId,
            paperPatternId,
            paperCertId,
          },
        })) ||
        (await tx.officialPriceCondition.create({
          data: {
            productId,
            grammage,
            sizeX,
            sizeY,
            paperColorGroupId,
            paperColorId,
            paperPatternId,
            paperCertId,
          },
        }));

      const officialPrices = await tx.officialPriceMap.findMany({
        where: {
          officialPriceConditionId: condition.id,
          companyId,
        },
      });
      if (officialPrices.length > 0 && officialPrices[0].isDeleted === false)
        throw new BadRequestException(`이미 존재하는 고시가 조건입니다.`);

      if (officialPrices.length > 0) {
        const wholesale = officialPrices.find(
          (op) => op.officialPriceMapType === 'WHOLESALE',
        );
        const retail = officialPrices.find(
          (op) => op.officialPriceMapType === 'RETAIL',
        );

        await tx.officialPriceMap.update({
          data: {
            officialPrice: wholesalePrice.officialPrice,
            officialPriceUnit: wholesalePrice.officialPriceUnit,
            isDeleted: false,
          },
          where: {
            id: wholesale.id,
          },
        });

        await tx.officialPriceMap.update({
          data: {
            officialPrice: retailPrice.officialPrice,
            officialPriceUnit: retailPrice.officialPriceUnit,
            isDeleted: false,
          },
          where: {
            id: retail.id,
          },
        });
      } else {
        await tx.officialPriceMap.createMany({
          data: [
            {
              companyId,
              officialPriceConditionId: condition.id,
              officialPrice: wholesalePrice.officialPrice,
              officialPriceUnit: wholesalePrice.officialPriceUnit,
              officialPriceMapType: 'WHOLESALE',
            },
            {
              companyId,
              officialPriceConditionId: condition.id,
              officialPrice: retailPrice.officialPrice,
              officialPriceUnit: retailPrice.officialPriceUnit,
              officialPriceMapType: 'RETAIL',
            },
          ],
        });
      }
    });
  }

  async update(
    companyId: number,
    officialPriceConditionId: number,
    wholesalePrice: OfficialPrice,
    retailPrice: OfficialPrice,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const condition = await tx.officialPriceCondition.findFirst({
        include: {
          officialPriceMap: {
            where: {
              companyId,
              isDeleted: false,
            },
          },
        },
        where: {
          id: officialPriceConditionId,
          officialPriceMap: {
            some: {
              companyId,
              isDeleted: false,
            },
          },
        },
      });
      if (!condition)
        throw new NotFoundException(`존재하지 않는 고시가 입니다.`);

      const wholesale = condition.officialPriceMap.find(
        (opm) => opm.officialPriceMapType === 'WHOLESALE',
      );
      const retail = condition.officialPriceMap.find(
        (opm) => opm.officialPriceMapType === 'RETAIL',
      );

      await tx.officialPriceMap.update({
        data: {
          officialPrice: wholesalePrice.officialPrice,
          officialPriceUnit: wholesalePrice.officialPriceUnit,
        },
        where: {
          id: wholesale.id,
        },
      });

      await tx.officialPriceMap.update({
        data: {
          officialPrice: retailPrice.officialPrice,
          officialPriceUnit: retailPrice.officialPriceUnit,
        },
        where: {
          id: retail.id,
        },
      });
    });
  }

  async delete(companyId: number, officialPriceConditionId: number) {
    await this.prisma.$transaction(async (tx) => {
      const condition = await tx.officialPriceCondition.findFirst({
        include: {
          officialPriceMap: {
            where: {
              companyId,
              isDeleted: false,
            },
          },
        },
        where: {
          id: officialPriceConditionId,
          officialPriceMap: {
            some: {
              companyId,
              isDeleted: false,
            },
          },
        },
      });
      if (!condition)
        throw new NotFoundException(`존재하지 않는 고시가 입니다.`);

      await tx.officialPriceMap.updateMany({
        where: {
          id: {
            in: condition.officialPriceMap.map((opm) => opm.id),
          },
        },
        data: {
          isDeleted: true,
        },
      });
    });
  }
}
