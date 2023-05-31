import { Injectable } from '@nestjs/common';
import { Model } from 'src/@shared';
import { PrismaService } from 'src/core';
import { ulid } from 'ulid';

@Injectable()
export class PlanChangeService {
  constructor(private prisma: PrismaService) {}

  /** 신규 재고를 생성합니다.
   * Stock, StockEvent, Plan(INHOUSE_CREATE), Task(INHOUSE_CREATE) 생성
   * @returns 생성된 record의 id
   */
  async insertInstantiate(
    tx: Omit<
      PrismaService,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
    >,
    params: {
      companyId: number;
      productId: number;
      packagingId: number;
      grammage: number;
      sizeX: number;
      sizeY: number;
      paperColorGroupId: number | null;
      paperColorId: number | null;
      paperPatternId: number | null;
      paperCertId: number | null;
      warehouseId: number | null;
      quantity: number;
      price: Model.StockPrice;
    },
  ) {
    const {
      companyId,
      productId,
      packagingId,
      grammage,
      sizeX,
      sizeY,
      paperColorGroupId,
      paperColorId,
      paperPatternId,
      paperCertId,
      warehouseId,
      quantity,
      price,
    } = params;

    const stock = await tx.stock.create({
      data: {
        serial: ulid(),
        companyId,
        productId,
        packagingId,
        grammage,
        sizeX,
        sizeY,
        paperColorGroupId,
        paperColorId,
        paperPatternId,
        paperCertId,
        warehouseId,
        cachedQuantity: quantity,
        stockPrice: {
          create: {
            ...price,
          },
        },
      },
      select: {
        id: true,
      },
    });

    const stockEvent = await tx.stockEvent.create({
      data: {
        stock: {
          connect: {
            id: stock.id,
          },
        },
        change: quantity,
        status: 'NORMAL',
      },
      select: {
        id: true,
      },
    });

    const plan = await tx.plan.create({
      data: {
        planNo: ulid(),
        type: 'INHOUSE_CREATE',
        companyId: companyId,
        targetStockEvent: {
          connect: {
            id: stockEvent.id,
          },
        },
      },
    });

    return {
      stockId: stock.id,
      stockEventId: stockEvent.id,
      planId: plan.id,
    };
  }

  /** 지정 Plan에 입고예정재고를 생성하거나 수정합니다.
   * 수량 수정: 이미 존재하는 동일한 스펙(Product~Cert)의 입고예정재고가 있다면 모두 취소(CANCELLED) 처리된 후 새로운 입고예정재고를 생성합니다.
   * @returns 생성된 record의 id
   */
  async upsertReceiving(
    tx: Omit<
      PrismaService,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
    >,
    params: {
      /** 입고예정재고를 생성할 PlanId */
      planId: number;
      productId: number;
      packagingId: number;
      grammage: number;
      sizeX: number;
      sizeY: number;
      paperColorGroupId: number | null;
      paperColorId: number | null;
      paperPatternId: number | null;
      paperCertId: number | null;
      warehouseId: number | null;
      quantity: number;
      price: Model.StockPrice;
    },
  ) {
    const {
      planId,
      productId,
      packagingId,
      grammage,
      sizeX,
      sizeY,
      paperColorGroupId,
      paperColorId,
      paperPatternId,
      paperCertId,
      warehouseId,
      quantity,
      price,
    } = params;

    const plan = await tx.plan.findUnique({
      where: {
        id: planId,
      },
      select: {
        id: true,
        companyId: true,
      },
    });

    // 동일한 스펙의 입고예정재고를 모두 취소처리
    await tx.stockEvent.updateMany({
      data: {
        status: 'CANCELLED',
      },
      where: {
        plan: {
          every: {
            id: {
              equals: planId,
            },
          },
        },
        stock: {
          productId,
          packagingId,
          grammage,
          sizeX,
          sizeY,
          paperColorGroupId,
          paperColorId,
          paperPatternId,
          paperCertId,
        },
        status: 'PENDING',
      },
    });

    const stock = await tx.stock.create({
      data: {
        serial: ulid(),
        companyId: plan.companyId,
        productId,
        packagingId,
        grammage,
        sizeX,
        sizeY,
        paperColorGroupId,
        paperColorId,
        paperPatternId,
        paperCertId,
        warehouseId,
        cachedQuantity: quantity,
        stockPrice: {
          create: {
            ...price,
          },
        },
      },
      select: {
        id: true,
      },
    });

    const stockEvent = await tx.stockEvent.create({
      data: {
        stock: {
          connect: {
            id: stock.id,
          },
        },
        change: quantity,
        status: 'PENDING',
        plan: {
          connect: {
            id: planId,
          },
        },
      },
      select: {
        id: true,
      },
    });

    return {
      stockId: stock.id,
      stockEventId: stockEvent.id,
    };
  }
}
