import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderRequestItemStatus } from '@prisma/client';
import * as dayjs from 'dayjs';
import { Util } from 'src/common';
import { PrismaTransaction } from 'src/common/types';
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

      const dstCompany = await tx.company.findUnique({
        where: {
          id: parmas.dstCompanyId,
        },
      });
      if (dstCompany.managedById !== null) {
        throw new BadRequestException(
          `미연결 거래체에는 퀵주문이 불가능합니다.`,
        );
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

      // 번호 생성
      const month = dayjs().format('YYMM');
      const checkCount: {
        serial: string;
      }[] = await tx.$queryRaw`
        SELECT ri.serial
          FROM OrderRequestItem   AS ri
          JOIN OrderRequest       AS r      ON r.id = ri.orderRequestId
         WHERE r.dstCompanyId = ${dstCompany.id}
           AND ri.serial LIKE ${'Q' + dstCompany.invoiceCode + month + '%'}
         ORDER BY ri.id DESC

         FOR UPDATE;
      `;
      let num =
        checkCount.length > 0
          ? Number(checkCount[0].serial.substring(9, 15)) + 1
          : 1;

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
          ordererPhoneNo: user.phoneNo,
          location: parmas.locationId
            ? {
                connect: {
                  id: parmas.locationId,
                },
              }
            : undefined,
          wantedDate: parmas.wantedDate,
          memo: parmas.memo || '',
          orderRequestItems: {
            createMany: {
              data: parmas.orderRequestItems.map((item) => ({
                serial: Util.serialQ(dstCompany.invoiceCode, month, num++),
                item: item.item,
                quantity: item.quantity || '',
                memo: item.memo || '',
              })),
            },
          },
        },
      });
    });
  }

  async check(companyId: number, orderRequestId: number) {
    const req = await this.prisma.orderRequest.findUnique({
      where: {
        id: orderRequestId,
      },
    });
    if (
      !req ||
      (req.dstCompanyId !== companyId && req.srcCompanyId !== companyId)
    )
      throw new NotFoundException(`존재하지 않는 퀵주문 입니다.`);

    if (req.dstCompanyId === companyId) {
      await this.prisma.$queryRaw`
        UPDATE OrderRequest     AS r
          JOIN OrderRequestItem AS ri ON ri.orderRequestId = r.id
           SET ri.status = (CASE
            WHEN ri.status = ${OrderRequestItemStatus.REQUESTED} THEN ${OrderRequestItemStatus.ON_CHECKING}
            ELSE ri.status
           END)
        WHERE r.id = ${orderRequestId};
      `;
    }
  }

  private async getItemForUpdateTx(
    tx: PrismaTransaction,
    orderRequestItemId: number,
  ): Promise<{
    id: number;
    dstCompanyId: number;
    srcCompanyId: number;
    status: OrderRequestItemStatus;
  } | null> {
    const [item]: {
      id: number;
      dstCompanyId: number;
      srcCompanyId: number;
      status: OrderRequestItemStatus;
    }[] = await tx.$queryRaw`
      SELECT ri.id AS id
            , r.srcCompanyId AS srcCompanyId
            , r.dstCompanyId AS dstCompanyId
            , status AS status
        FROM OrderRequestItem   AS ri
        JOIN OrderRequest       AS r    ON r.id = ri.orderRequestId
      WHERE ri.id = ${orderRequestItemId}

      FOR UPDATE;
    `;

    return item || null;
  }

  async cancel(companyId: number, orderRequestItemId: number) {
    await this.prisma.$transaction(async (tx) => {
      const item = await this.getItemForUpdateTx(tx, orderRequestItemId);
      if (
        !item ||
        (item.srcCompanyId !== companyId && item.dstCompanyId !== companyId)
      )
        throw new NotFoundException(`존재하지 않는 퀵주문 상품입니다.`);

      if (item.srcCompanyId !== companyId)
        throw new ForbiddenException(`주문취소 권한이 없습니다.`);
      if (item.status !== 'REQUESTED')
        throw new ConflictException(`주문취소 가능한 상태가 아닙니다.`);

      await tx.orderRequestItem.update({
        where: {
          id: orderRequestItemId,
        },
        data: {
          status: 'CANCELLED',
        },
      });
    });
  }

  async done(companyId: number, orderRequestItemId: number, dstMemo: string) {
    await this.prisma.$transaction(async (tx) => {
      const item = await this.getItemForUpdateTx(tx, orderRequestItemId);

      if (
        !item ||
        (item.srcCompanyId !== companyId && item.dstCompanyId !== companyId)
      )
        throw new NotFoundException(`존재하지 않는 퀵주문 상품입니다.`);

      if (item.dstCompanyId !== companyId)
        throw new ForbiddenException(`주문처리완료 권한이 없습니다.`);
      if (item.status !== 'REQUESTED' && item.status !== 'ON_CHECKING')
        throw new ConflictException(`주문처리완료 가능한 상태가 아닙니다.`);

      await tx.orderRequestItem.update({
        where: {
          id: orderRequestItemId,
        },
        data: {
          status: 'DONE',
          dstMemo,
        },
      });
    });
  }
}
