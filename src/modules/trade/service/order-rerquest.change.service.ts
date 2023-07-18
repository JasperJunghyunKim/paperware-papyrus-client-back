import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/core';

@Injectable()
export class OrderRequestChangeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(parmas: {
    userId: number;
    companyId: number;
    dstCompanyId: number;
    wantedDate: string | null;
    locationId: number | null;
    memo: string;
    orderRequestItems: {
      item: string;
      quantity: string;
      memo: string;
    }[];
  }) {
    if (parmas.companyId === parmas.dstCompanyId)
      throw new BadRequestException(
        `자신의 회사에는 퀵주문을 요청할 수 없습니다.`,
      );
    await this.prisma.$transaction(async (tx) => {
      // 거래처 확인
      const company = await tx.company.findUnique({
        select: {
          dstBusinessRelationship: {
            where: {
              srcCompanyId: parmas.dstCompanyId,
            },
          },
          srcBusinessRelationship: {
            where: {
              dstCompanyId: parmas.dstCompanyId,
            },
          },
        },
        where: {
          id: parmas.companyId,
        },
      });
      if (
        company.dstBusinessRelationship.length === 0 ||
        !company.dstBusinessRelationship[0].isActivated
      ) {
        throw new ConflictException(`매입이 가능한 거래관계가 아닙니다.`);
      }

      // 도착지 확인
      if (parmas.locationId) {
        const location = await tx.location.findFirst({
          where: {
            id: parmas.locationId,
            isDeleted: false,
          },
        });
        if (!location)
          throw new BadRequestException(`존재하지 않는 도착지 입니다.`);
      }

      const user = await tx.user.findUnique({
        where: {
          id: parmas.userId,
        },
      });

      // 생성
      const orderRequest = await tx.orderRequest.create({
        data: {
          srcCompany: {
            connect: {
              id: parmas.companyId,
            },
          },
          dstCompany: {
            connect: {
              id: parmas.dstCompanyId,
            },
          },
          ordererName: user.name,
          ordererPhoneNo: '', // TODO: user.phoneNo
          location: parmas.locationId
            ? {
                connect: {
                  id: parmas.locationId,
                },
              }
            : undefined,
          wantedDate: parmas.wantedDate,
          memo: parmas.memo,
          orderRequestItems: {
            createMany: {
              data: [], // TODO: 데이터 넣기
            },
          },
        },
      });
    });
  }
}
