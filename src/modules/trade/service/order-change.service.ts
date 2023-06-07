import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { Company, DepositType, DiscountType, OfficialPriceType, OrderDeposit, OrderType, PriceUnit } from '@prisma/client';
import { Model } from 'src/@shared';
import { StockCreateStockPriceRequest } from 'src/@shared/api';
import { Util } from 'src/common';
import { PrismaService } from 'src/core';
import { ulid } from 'ulid';
import { TradePriceValidator } from './trade-price.validator';
import { PrismaTransaction } from 'src/common/types';
import { DepositChangeService } from './deposit-change.service';

interface UpdateTradePriceParams {
  orderId: number;
  companyId: number;
  suppliedPrice: number;
  vatPrice: number;
  orderStockTradePrice?: {
    officialPriceType: OfficialPriceType;
    officialPrice: number;
    officialPriceUnit: PriceUnit;
    discountType: DiscountType;
    discountPrice: number;
    unitPrice: number;
    unitPriceUnit: PriceUnit;
    processPrice: number;
    orderStockTradeAltBundle?: {
      altSizeX: number;
      altSizeY: number;
      altQuantity: number;
    };
  };
}

@Injectable()
export class OrderChangeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tradePriceValidator: TradePriceValidator,
    private readonly depositChangeService: DepositChangeService,
  ) { }

  async insertOrder(params: {
    srcCompanyId: number;
    dstCompanyId: number;
    locationId: number;
    warehouseId: number | null;
    planId: number | null;
    productId: number;
    packagingId: number;
    grammage: number;
    sizeX: number;
    sizeY: number;
    paperColorGroupId: number | null;
    paperColorId: number | null;
    paperPatternId: number | null;
    paperCertId: number | null;
    quantity: number;
    memo: string;
    wantedDate: string;
    isOffer: boolean;
  }) {
    const isEntrusted =
      !!(
        await this.prisma.company.findUnique({
          where: {
            id: params.srcCompanyId,
          },
          select: {
            managedById: true,
          },
        })
      ).managedById ||
      !!(
        await this.prisma.company.findUnique({
          where: {
            id: params.dstCompanyId,
          },
          select: {
            managedById: true,
          },
        })
      ).managedById;

    return await this.prisma.$transaction(async (tx) => {
      // 구매처 작업 계획
      const srcPlan = await tx.plan.create({
        data: {
          planNo: ulid(),
          type: 'TRADE_NORMAL_BUYER',
          companyId: params.srcCompanyId,
        },
      });

      // 판매처 작업 계획
      const dstPlan = await tx.plan.create({
        data: {
          planNo: ulid(),
          type: 'TRADE_NORMAL_SELLER',
          companyId: params.dstCompanyId,
        },
        select: {
          id: true,
          company: {
            select: {
              invoiceCode: true,
            },
          },
        },
      });

      // 원지 재고 생성
      const stock = await tx.stock.create({
        data: {
          serial: Util.serialP(dstPlan.company.invoiceCode),
          companyId: params.dstCompanyId,
          initialPlanId: dstPlan.id,
          warehouseId: params.warehouseId,
          planId: params.planId,
          productId: params.productId,
          packagingId: params.packagingId,
          grammage: params.grammage,
          sizeX: params.sizeX,
          sizeY: params.sizeY,
          paperColorGroupId: params.paperColorGroupId,
          paperColorId: params.paperColorId,
          paperPatternId: params.paperPatternId,
          paperCertId: params.paperCertId,
          cachedQuantity: 0,
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
          change: -params.quantity,
          status: 'PENDING',
          assignPlan: {
            connect: {
              id: dstPlan.id,
            },
          },
        },
        select: {
          id: true,
        },
      });

      // 주문 생성
      const order = await tx.order.create({
        data: {
          orderNo: ulid(),
          orderType: 'NORMAL',
          srcCompany: {
            connect: {
              id: params.srcCompanyId,
            },
          },
          dstCompany: {
            connect: {
              id: params.dstCompanyId,
            },
          },
          status: params.isOffer ? 'OFFER_PREPARING' : 'ORDER_PREPARING',
          isEntrusted,
          memo: params.memo,
          wantedDate: params.wantedDate,
          orderStock: {
            create: {
              dstLocationId: params.locationId,
              plan: {
                connect: [dstPlan.id, srcPlan.id].map((p) => ({ id: p })),
              },
            },
          },
        },
        select: {
          id: true,
        },
      });

      return {
        srcPlanId: srcPlan.id,
        dstPlanId: dstPlan.id,
        stockId: stock.id,
        stockEventId: stockEvent.id,
        orderId: order.id,
      };
    });
  }

  async updateOrder(params: {
    orderId: number;
    locationId: number;
    memo: string;
    wantedDate: string;
  }) {
    return await this.prisma.$transaction(async (tx) => {
      // 주문 업데이트
      const order = await tx.order.update({
        where: {
          id: params.orderId,
        },
        data: {
          wantedDate: params.wantedDate,
          memo: params.memo,
        },
        select: {
          id: true,
          srcCompanyId: true,
          dstCompanyId: true,
        },
      });

      // 주문 정상거래 업데이트
      const orderStock = await tx.orderStock.update({
        where: {
          orderId: params.orderId,
        },
        data: {
          dstLocationId: params.locationId,
        },
        select: {
          id: true,
        },
      });

      return {
        orderId: order.id,
        orderStockId: orderStock.id,
      };
    });
  }

  /** 원지를 업데이트합니다 */
  async updateOrderAssignStock(params: {
    orderId: number;
    warehouseId: number | null;
    planId: number | null;
    productId: number;
    packagingId: number;
    grammage: number;
    sizeX: number;
    sizeY: number;
    paperColorGroupId: number | null;
    paperColorId: number | null;
    paperPatternId: number | null;
    paperCertId: number | null;
    quantity: number;
  }) {
    return await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: {
          id: params.orderId,
        },
        select: {
          srcCompanyId: true,
          dstCompanyId: true,
        },
      });

      const orderStock = await tx.orderStock.findUnique({
        where: {
          orderId: params.orderId,
        },
      });

      const dstPlan = await tx.plan.findFirst({
        where: {
          orderStockId: orderStock.id,
          companyId: order.dstCompanyId,
        },
        select: {
          id: true,
          company: {
            select: {
              invoiceCode: true,
            },
          },
        },
      });

      // 기존 원지 이벤트 취소
      await tx.stockEvent.updateMany({
        where: {
          assignPlan: {
            every: {
              id: dstPlan.id,
            },
          },
        },
        data: {
          status: 'CANCELLED',
        },
      });

      // 원지 재고 생성
      const stock = await tx.stock.create({
        data: {
          serial: Util.serialP(dstPlan.company.invoiceCode),
          companyId: order.dstCompanyId,
          initialPlanId: dstPlan.id,
          planId: params.planId,
          warehouseId: params.warehouseId,
          productId: params.productId,
          packagingId: params.packagingId,
          grammage: params.grammage,
          sizeX: params.sizeX,
          sizeY: params.sizeY,
          paperColorGroupId: params.paperColorGroupId,
          paperColorId: params.paperColorId,
          paperPatternId: params.paperPatternId,
          paperCertId: params.paperCertId,
          cachedQuantity: 0,
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
          change: -params.quantity,
          status: 'PENDING',
          assignPlan: {
            connect: {
              id: dstPlan.id,
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
    });
  }

  async checkStock(params: {
    warehouseId: number | null;
    planId: number | null;
    productId: number;
    packagingId: number;
    grammage: number;
    sizeX: number;
    sizeY: number;
    paperColorGroupId: number | null;
    paperColorId: number | null;
    paperPatternId: number | null;
    paperCertId: number | null;
    quantity: number;
  }) {
    const quantity = await this.prisma.stockEvent.findMany({
      where: {
        stock: {
          warehouseId: params.warehouseId,
          planId: params.planId,
          productId: params.productId,
          packagingId: params.packagingId,
          grammage: params.grammage,
          sizeX: params.sizeX,
          sizeY: params.sizeY,
          paperColorGroupId: params.paperColorGroupId,
          paperColorId: params.paperColorId,
          paperPatternId: params.paperPatternId,
          paperCertId: params.paperCertId,
        },
      },
      select: {
        change: true,
        status: true,
      },
    });

    const total = quantity.reduce((acc, cur) => {
      return acc + (cur.status === 'CANCELLED' ? 0 : cur.change);
    }, 0);

    if (total < params.quantity) {
      throw new BadRequestException(
        `재고가 부족합니다. 가용수량 이내로 수량을 입력해주세요.`,
      );
    }
  }

  async request(params: { orderId: number }) {
    const { orderId } = params;

    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: {
          id: orderId,
        },
        select: {
          status: true,
        },
      });

      if (!Util.inc(order.status, 'OFFER_PREPARING', 'ORDER_PREPARING')) {
        throw new Error('Invalid order status');
      }

      await tx.order.update({
        where: {
          id: orderId,
        },
        data: {
          status:
            order.status === 'OFFER_PREPARING'
              ? 'OFFER_REQUESTED'
              : 'ORDER_REQUESTED',
        },
      });
    });
  }

  async cancel(params: { orderId: number }) {
    const { orderId } = params;

    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: {
          id: orderId,
        },
        select: {
          status: true,
        },
      });

      if (!Util.inc(order.status, 'OFFER_PREPARING', 'ORDER_PREPARING')) {
        throw new Error('Invalid order status');
      }

      await tx.order.update({
        where: {
          id: orderId,
        },
        data: {
          status:
            order.status === 'OFFER_PREPARING'
              ? 'OFFER_CANCELLED'
              : 'ORDER_CANCELLED',
        },
      });
    });
  }

  async accept(params: { orderId: number }) {
    const { orderId } = params;

    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: {
          id: orderId,
        },
        select: {
          srcCompany: true,
          dstCompany: true,
          status: true,
          orderType: true,
          orderDeposit: true,
        },
      });

      // TODO... 주문상태에 따라 제한 필요

      await tx.order.update({
        where: {
          id: orderId,
        },
        data: {
          status: 'ACCEPTED',
        },
      });

      switch (order.orderType) {
        case OrderType.DEPOSIT:
          await this.createDeposit(
            tx,
            order.srcCompany,
            order.dstCompany,
            order.orderDeposit,
          );
          break;
        default:
          break;
      }
    });
  }

  private async createDeposit(
    tx: PrismaTransaction,
    srcCompany: Company,
    dstCompany: Company,
    orderDeposit: OrderDeposit,
  ) {
    // srcCompany
    if (!srcCompany.managedById) {
      const deposit = await tx.deposit.findFirst({
        where: {
          companyId: srcCompany.id,
          partnerCompanyRegistrationNumber: dstCompany.companyRegistrationNumber,
          depositType: DepositType.PURCHASE,
          packagingId: orderDeposit.packagingId,
          productId: orderDeposit.productId,
          grammage: orderDeposit.grammage,
          sizeX: orderDeposit.sizeX,
          sizeY: orderDeposit.sizeY,
          paperColorGroupId: orderDeposit.paperColorGroupId,
          paperColorId: orderDeposit.paperColorId,
          paperPatternId: orderDeposit.paperPatternId,
          paperCertId: orderDeposit.paperCertId,
        }
      }) || await tx.deposit.create({
        data: {
          company: {
            connect: {
              id: srcCompany.id
            }
          },
          partnerCompanyRegistrationNumber: dstCompany.companyRegistrationNumber,
          depositType: DepositType.PURCHASE,
          packaging: {
            connect: {
              id: orderDeposit.packagingId,
            }
          },
          product: {
            connect: {
              id: orderDeposit.productId,
            }
          },
          grammage: orderDeposit.grammage,
          sizeX: orderDeposit.sizeX,
          sizeY: orderDeposit.sizeY,
          paperColorGroup: orderDeposit.paperColorGroupId ? {
            connect: {
              id: orderDeposit.paperColorGroupId,
            }
          } : undefined,
          paperColor: orderDeposit.paperColorId ? {
            connect: {
              id: orderDeposit.paperColorId,
            }
          } : undefined,
          paperPattern: orderDeposit.paperPatternId ? {
            connect: {
              id: orderDeposit.paperPatternId,
            }
          } : undefined,
          paperCert: orderDeposit.paperCertId ? {
            connect: {
              id: orderDeposit.paperCertId,
            }
          } : undefined,
        }
      });
      // event 생성
      await tx.depositEvent.create({
        data: {
          deposit: {
            connect: {
              id: deposit.id
            }
          },
          change: orderDeposit.quantity,
          orderDeposit: {
            connect: {
              id: orderDeposit.id,
            }
          },
        }
      });
    }

    // dstCompany
    if (!dstCompany.managedById) {
      const partner = await tx.partner.findUnique({
        where: {
          companyId_companyRegistrationNumber: {
            companyId: dstCompany.id,
            companyRegistrationNumber: srcCompany.companyRegistrationNumber,
          }
        }
      });
      const deposit = await tx.deposit.findFirst({
        where: {
          companyId: dstCompany.id,
          partnerCompanyRegistrationNumber: srcCompany.companyRegistrationNumber,
          depositType: DepositType.SALES,
          packagingId: orderDeposit.packagingId,
          productId: orderDeposit.productId,
          grammage: orderDeposit.grammage,
          sizeX: orderDeposit.sizeX,
          sizeY: orderDeposit.sizeY,
          paperColorGroupId: orderDeposit.paperColorGroupId,
          paperColorId: orderDeposit.paperColorId,
          paperPatternId: orderDeposit.paperPatternId,
          paperCertId: orderDeposit.paperCertId,
        }
      }) || await tx.deposit.create({
        data: {
          company: {
            connect: {
              id: dstCompany.id
            }
          },
          partnerCompanyRegistrationNumber: srcCompany.companyRegistrationNumber,
          depositType: DepositType.SALES,
          packaging: {
            connect: {
              id: orderDeposit.packagingId,
            }
          },
          product: {
            connect: {
              id: orderDeposit.productId,
            }
          },
          grammage: orderDeposit.grammage,
          sizeX: orderDeposit.sizeX,
          sizeY: orderDeposit.sizeY,
          paperColorGroup: orderDeposit.paperColorGroupId ? {
            connect: {
              id: orderDeposit.paperColorGroupId,
            }
          } : undefined,
          paperColor: orderDeposit.paperColorId ? {
            connect: {
              id: orderDeposit.paperColorId,
            }
          } : undefined,
          paperPattern: orderDeposit.paperPatternId ? {
            connect: {
              id: orderDeposit.paperPatternId,
            }
          } : undefined,
          paperCert: orderDeposit.paperCertId ? {
            connect: {
              id: orderDeposit.paperCertId,
            }
          } : undefined,
        }
      });
      // event 생성
      await tx.depositEvent.create({
        data: {
          deposit: {
            connect: {
              id: deposit.id
            }
          },
          change: orderDeposit.quantity,
          orderDeposit: {
            connect: {
              id: orderDeposit.id,
            }
          },
        }
      });
    }
  }

  async reject(params: { orderId: number }) {
    const { orderId } = params;

    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: {
          id: orderId,
        },
        select: {
          status: true,
        },
      });

      if (!Util.inc(order.status, 'OFFER_REQUESTED', 'ORDER_REQUESTED')) {
        throw new Error('Invalid order status');
      }

      await tx.order.update({
        where: {
          id: orderId,
        },
        data: {
          status:
            order.status === 'OFFER_REQUESTED'
              ? 'OFFER_REJECTED'
              : 'ORDER_REJECTED',
        },
      });
    });
  }

  async reset(params: { orderId: number }) {
    const { orderId } = params;

    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: {
          id: orderId,
        },
        select: {
          status: true,
        },
      });

      if (!Util.inc(order.status, 'OFFER_REJECTED', 'ORDER_REJECTED')) {
        throw new Error('Invalid order status');
      }

      await tx.order.update({
        where: {
          id: orderId,
        },
        data: {
          status:
            order.status === 'OFFER_REJECTED'
              ? 'OFFER_PREPARING'
              : 'ORDER_PREPARING',
        },
      });
    });
  }

  async createArrival(params: {
    orderId: number;
    productId: number;
    packagingId: number;
    grammage: number;
    sizeX: number;
    sizeY: number;
    paperColorGroupId: number | null;
    paperColorId: number | null;
    paperPatternId: number | null;
    paperCertId: number | null;
    quantity: number;
    stockPrice: StockCreateStockPriceRequest;
    isSyncPrice: boolean;
  }) {
    return await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: {
          id: params.orderId,
        },
        select: {
          srcCompanyId: true,
          dstCompanyId: true,
        },
      });

      const orderStock = await tx.orderStock.findUnique({
        where: {
          orderId: params.orderId,
        },
      });

      const srcPlan = await tx.plan.findFirst({
        where: {
          orderStockId: orderStock.id,
          companyId: order.srcCompanyId,
        },
        select: {
          id: true,
          company: {
            select: {
              invoiceCode: true,
            },
          },
        },
      });

      // 구매처 작업계획의 동일한 스펙 입고예정재고 모두 취소처리
      await tx.stockEvent.updateMany({
        data: {
          status: 'CANCELLED',
        },
        where: {
          plan: {
            every: {
              id: {
                equals: srcPlan.id,
              },
            },
          },
          stock: {
            productId: params.productId,
            packagingId: params.packagingId,
            grammage: params.grammage,
            sizeX: params.sizeX,
            sizeY: params.sizeY,
            paperColorGroupId: params.paperColorGroupId,
            paperColorId: params.paperColorId,
            paperPatternId: params.paperPatternId,
            paperCertId: params.paperCertId,
          },
          status: 'PENDING',
        },
      });

      // 새 입고 예정 재고 추가
      const stock = await tx.stock.create({
        data: {
          serial: Util.serialP(srcPlan.company.invoiceCode),
          companyId: order.srcCompanyId,
          planId: srcPlan.id,
          initialPlanId: srcPlan.id,
          productId: params.productId,
          packagingId: params.packagingId,
          grammage: params.grammage,
          sizeX: params.sizeX,
          sizeY: params.sizeY,
          paperColorGroupId: params.paperColorGroupId,
          paperColorId: params.paperColorId,
          paperPatternId: params.paperPatternId,
          paperCertId: params.paperCertId,
          cachedQuantity: params.quantity,
          stockPrice: {
            create: {
              ...params.stockPrice,
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
          change: params.quantity,
          status: 'PENDING',
          plan: {
            connect: {
              id: srcPlan.id,
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
    });
  }

  /** 거래금액 수정 */
  async updateTradePrice(
    companyId: number,
    orderId: number,
    tradePriceDto: UpdateTradePriceParams,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        include: {
          tradePrice: {
            include: {
              orderStockTradePrice: {
                include: {
                  orderStockTradeAltBundle: true,
                },
              },
            },
          },
          orderStock: {
            include: {
              plan: {
                include: {
                  assignStockEvent: {
                    include: {
                      stock: {
                        include: {
                          packaging: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        where: {
          id: orderId,
          OR: [{ srcCompanyId: companyId }, { dstCompanyId: companyId }],
        },
      });
      if (!order) throw new NotFoundException('존재하지 않는 주문'); // 모듈 이동시 Exception 생성하여 처리

      // 원지 정보는 판매자(dstCompany)의 Plan에서 지정하므로 판매자의 Plan을 필터링
      const plan = order.orderStock.plan.find(
        (plan) => plan.companyId === order.dstCompanyId,
      );

      // 금액정보 validation
      this.tradePriceValidator.validateTradePrice(
        plan.assignStockEvent.stock.packaging.type,
        tradePriceDto,
      );

      //   const tradePrice =
      //     (await tx.tradePrice.findFirst({
      //       where: {
      //         orderId: order.id,
      //         companyId: companyId,
      //       },
      //       include: {
      //         orderStockTradePrice: {
      //           include: {
      //             orderStockTradeAltBundle: true,
      //           },
      //         },
      //       },
      //     })) ??
      //     (await tx.tradePrice.create({
      //       data: {
      //         orderId: order.id,
      //         companyId: companyId,
      //         orderStockTradePrice: {
      //           create: {
      //             officialPriceType:
      //               tradePriceDto.orderStockTradePrice.officialPriceType,
      //             officialPrice: tradePriceDto.orderStockTradePrice.officialPrice,
      //             officialPriceUnit:
      //               tradePriceDto.orderStockTradePrice.officialPriceUnit,
      //             discountType: tradePriceDto.orderStockTradePrice.discountType,
      //             discountPrice: tradePriceDto.orderStockTradePrice.discountPrice,
      //             unitPrice: tradePriceDto.orderStockTradePrice.unitPrice,
      //             unitPriceUnit: tradePriceDto.orderStockTradePrice.unitPriceUnit,
      //             processPrice: tradePriceDto.orderStockTradePrice.processPrice,
      //           },
      //         },
      //       },
      //       include: {
      //         orderStockTradePrice: {
      //           include: {
      //             orderStockTradeAltBundle: true,
      //           },
      //         },
      //       },
      //     }));
      //   if (tradePrice.isBookClosed) {
      //     throw new ConflictException(`이미 마감된 주문정보 입니다.`);
      //   }

      //   if (tradePrice.orderStockTradePrice) {
      //     if (!tradePriceDto.orderStockTradePrice)
      //       throw new BadRequestException(`orderStockTradePrice가 필요합니다.`); // TODO... Exception 추가

      //     await tx.orderStockTradePrice.update({
      //       data: {
      //         officialPriceType:
      //           tradePriceDto.orderStockTradePrice.officialPriceType,
      //         officialPrice: tradePriceDto.orderStockTradePrice.officialPrice,
      //         officialPriceUnit:
      //           tradePriceDto.orderStockTradePrice.officialPriceUnit,
      //         discountType: tradePriceDto.orderStockTradePrice.discountType,
      //         discountPrice: tradePriceDto.orderStockTradePrice.discountPrice,
      //         unitPrice: tradePriceDto.orderStockTradePrice.unitPrice,
      //         unitPriceUnit: tradePriceDto.orderStockTradePrice.unitPriceUnit,
      //         processPrice: tradePriceDto.orderStockTradePrice.processPrice,
      //       },
      //       where: {
      //         orderId_companyId: {
      //           orderId: tradePriceDto.orderId,
      //           companyId: tradePriceDto.companyId,
      //         },
      //       },
      //     });

      //     if (tradePrice.orderStockTradePrice.orderStockTradeAltBundle) {
      //       await tx.orderStockTradeAltBundle.delete({
      //         where: {
      //           orderId_companyId: {
      //             orderId: tradePriceDto.orderId,
      //             companyId: tradePriceDto.companyId,
      //           },
      //         },
      //       });
      //     }

      //     const altBundle =
      //       tradePriceDto.orderStockTradePrice.orderStockTradeAltBundle;
      //     if (altBundle) {
      //       await tx.orderStockTradeAltBundle.create({
      //         data: {
      //           ...altBundle,
      //           orderId: tradePriceDto.orderId,
      //           companyId: tradePriceDto.companyId,
      //         },
      //       });
      //     }
      //   }

      //   await tx.tradePrice.update({
      //     data: {
      //       suppliedPrice: tradePriceDto.suppliedPrice,
      //       vatPrice: tradePriceDto.vatPrice,
      //     },
      //     where: {
      //       orderId_companyId: {
      //         orderId: tradePriceDto.orderId,
      //         companyId: tradePriceDto.companyId,
      //       },
      //     },
      //   });
    });
  }

  /** 보관 등록 */
  async createDepositOrder(
    srcCompanyId: number,
    dstCompanyId: number,
    isOffer: boolean,
    productId: number,
    packagingId: number,
    grammage: number,
    sizeX: number,
    sizeY: number,
    paperColorGroupId: number | null,
    paperColorId: number | null,
    paperPatternId: number | null,
    paperCertId: number | null,
    quantity: number,
    memo: string,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const businessRelationship = tx.businessRelationship.findUnique({
        where: {
          srcCompanyId_dstCompanyId: {
            srcCompanyId,
            dstCompanyId,
          }
        }
      });
      if (!businessRelationship) throw new ConflictException(`올바른 매입/매출관계가 아닙니다.`);

      const isEntrusted =
        !!(
          await tx.company.findUnique({
            where: {
              id: srcCompanyId,
            },
            select: {
              managedById: true,
            },
          })
        ).managedById ||
        !!(
          await tx.company.findUnique({
            where: {
              id: dstCompanyId,
            },
            select: {
              managedById: true,
            },
          })
        ).managedById;

      // 보관등록 주문 생성
      const order = await tx.order.create({
        select: {
          id: true,
        },
        data: {
          orderNo: ulid(),
          orderType: 'DEPOSIT',
          srcCompany: {
            connect: {
              id: srcCompanyId,
            },
          },
          dstCompany: {
            connect: {
              id: dstCompanyId,
            },
          },
          status: isOffer ? 'OFFER_PREPARING' : 'ORDER_PREPARING',
          isEntrusted,
          memo,
          orderDeposit: {
            create: {
              packaging: {
                connect: {
                  id: packagingId,
                }
              },
              product: {
                connect: {
                  id: productId,
                }
              },
              grammage,
              sizeX,
              sizeY,
              paperColorGroup: paperColorGroupId ? {
                connect: {
                  id: paperColorGroupId,
                }
              } : undefined,
              paperColor: paperColorId ? {
                connect: {
                  id: paperColorId,
                }
              } : undefined,
              paperPattern: paperPatternId ? {
                connect: {
                  id: paperPatternId,
                }
              } : undefined,
              paperCert: paperCertId ? {
                connect: {
                  id: paperCertId,
                }
              } : undefined,
              quantity,
            }
          }
        },
      });
    });
  }

  async createOrderDeposit(companyId: number, orderId: number, depositId: number, quantity: number) {
    await this.prisma.$transaction(async tx => {
      const order = await tx.order.findUnique({
        include: {
          srcCompany: true,
          dstCompany: true,
          orderDeposit: {
            include: {
              depositEvent: {
                include: {
                  deposit: true,
                }
              }
            }
          },
        },
        where: {
          id: orderId,
        }
      });
      if (!order || order.orderType !== "NORMAL" || (order.srcCompanyId !== companyId && order.dstCompanyId !== companyId)) throw new NotFoundException(`주문이 존재하지 않습니다.`);

      const type: DepositType = order.srcCompanyId === companyId ? DepositType.PURCHASE : DepositType.SALES;
      const partnerCompanyRegistrationNumber = type === DepositType.PURCHASE ? order.dstCompany.companyRegistrationNumber : order.srcCompany.companyRegistrationNumber;
      const orderDeposit = order.orderDeposit?.depositEvent.find(e => e.deposit.depositType === type) || null;
      if (orderDeposit) throw new ConflictException(`이미 보관이 선택되어 있습니다.`);

      const deposit = await tx.deposit.findUnique({
        where: {
          id: depositId,
        }
      });
      if (!deposit || deposit.companyId !== companyId || deposit.partnerCompanyRegistrationNumber !== partnerCompanyRegistrationNumber) throw new NotFoundException(`보관이 존재하지 않습니다.`);

      await this.depositChangeService.createDepositEventTx(tx, {
        depositId,
        orderId,
        packagingId: deposit.packagingId,
        productId: deposit.productId,
        grammage: deposit.grammage,
        sizeX: deposit.sizeX,
        sizeY: deposit.sizeY,
        paperColorGroupId: deposit.paperColorGroupId,
        paperColorId: deposit.paperColorId,
        paperPatternId: deposit.paperPatternId,
        paperCertId: deposit.paperCertId,
        quantity,
      });
    });
  }

  async updateOrderDeposit(companyId: number, orderId: number, depositId: number, quantity: number) {
    await this.prisma.$transaction(async tx => {
      const order = await tx.order.findUnique({
        include: {
          srcCompany: true,
          dstCompany: true,
          orderDeposit: {
            include: {
              depositEvent: {
                include: {
                  deposit: true,
                }
              }
            }
          },
        },
        where: {
          id: orderId,
        }
      });
      if (!order || order.orderType !== "NORMAL" || (order.srcCompanyId !== companyId && order.dstCompanyId !== companyId)) throw new NotFoundException(`주문이 존재하지 않습니다.`);

      const type: DepositType = order.srcCompanyId === companyId ? DepositType.PURCHASE : DepositType.SALES;
      const partnerCompanyRegistrationNumber = type === DepositType.PURCHASE ? order.dstCompany.companyRegistrationNumber : order.srcCompany.companyRegistrationNumber;
      const orderDepositEvent = order.orderDeposit?.depositEvent.find(e => e.deposit.depositType === type) || null;
      if (!orderDepositEvent) throw new ConflictException(`보관이 선택되어 있지 않습니다.`);

      const deposit = await tx.deposit.findUnique({
        where: {
          id: depositId,
        }
      });
      if (!deposit || deposit.companyId !== companyId || deposit.partnerCompanyRegistrationNumber !== partnerCompanyRegistrationNumber) throw new NotFoundException(`보관이 존재하지 않습니다.`);

      await this.depositChangeService.deleteOrderDepositEventTx(tx, orderDepositEvent.id);
      await this.depositChangeService.createDepositEventTx(tx, {
        depositId,
        orderId,
        packagingId: deposit.packagingId,
        productId: deposit.productId,
        grammage: deposit.grammage,
        sizeX: deposit.sizeX,
        sizeY: deposit.sizeY,
        paperColorGroupId: deposit.paperColorGroupId,
        paperColorId: deposit.paperColorId,
        paperPatternId: deposit.paperPatternId,
        paperCertId: deposit.paperCertId,
        quantity,
      });
    });
  }

  async deleteOrderDeposit(companyId: number, orderId: number) {
    await this.prisma.$transaction(async tx => {
      const order = await tx.order.findUnique({
        include: {
          srcCompany: true,
          dstCompany: true,
          orderDeposit: {
            include: {
              depositEvent: {
                include: {
                  deposit: true,
                }
              }
            }
          },
        },
        where: {
          id: orderId,
        }
      });
      if (!order || order.orderType !== "NORMAL" || (order.srcCompanyId !== companyId && order.dstCompanyId !== companyId)) throw new NotFoundException(`주문이 존재하지 않습니다.`);

      const type: DepositType = order.srcCompanyId === companyId ? DepositType.PURCHASE : DepositType.SALES;
      const orderDepositEvent = order.orderDeposit?.depositEvent.find(e => e.deposit.depositType === type) || null;
      if (!orderDepositEvent) throw new ConflictException(`보관이 선택되어 있지 않습니다.`);

      await this.depositChangeService.deleteOrderDepositEventTx(tx, orderDepositEvent.id);
    });
  }
}
