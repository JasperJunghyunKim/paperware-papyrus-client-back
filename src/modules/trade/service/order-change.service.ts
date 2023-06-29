import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import {
  Company,
  DepositEventStatus,
  DepositType,
  DiscountType,
  OfficialPriceType,
  OrderDeposit,
  OrderType,
  PackagingType,
  PlanType,
  PriceUnit,
} from '@prisma/client';
import { Model } from 'src/@shared';
import { StockCreateStockPriceRequest } from 'src/@shared/api';
import { Util } from 'src/common';
import { PrismaService } from 'src/core';
import { ulid } from 'ulid';
import { TradePriceValidator } from './trade-price.validator';
import { PrismaTransaction } from 'src/common/types';
import { DepositChangeService } from './deposit-change.service';
import { ORDER } from 'src/common/selector';
import { Plan } from 'src/@shared/models';
import { StockChangeService } from 'src/modules/stock/service/stock-change.service';
import { StockQuantityChecker } from 'src/modules/stock/service/stock-quantity-checker';

interface OrderStockTradePrice {
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
  } | null;
}

interface OrderDepositTradePrice {
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
  } | null;
}

interface UpdateTradePriceParams {
  suppliedPrice: number;
  vatPrice: number;
  orderStockTradePrice: OrderStockTradePrice | null;
  orderDepositTradePrice: OrderDepositTradePrice | null;
}

@Injectable()
export class OrderChangeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tradePriceValidator: TradePriceValidator,
    private readonly depositChangeService: DepositChangeService,
    private readonly stockChangeService: StockChangeService,
    private readonly stockQuantityChecker: StockQuantityChecker,
  ) {}

  private async updateOrderRevisionTx(tx: PrismaTransaction, orderId: number) {
    await tx.$queryRaw`UPDATE \`Order\` SET revision = revision + 1 WHERE id = ${orderId}`;
  }

  private async assignStockToNormalOrder(
    tx: PrismaTransaction,
    inquiryCompanyId: number,
    orderId: number,
  ) {
    const orderStock = await tx.orderStock.findUnique({
      include: {
        order: true,
      },
      where: {
        orderId,
      },
    });

    await this.stockQuantityChecker.checkStockGroupAvailableQuantityTx(tx, {
      inquiryCompanyId,
      companyId: orderStock.companyId,
      warehouseId: orderStock.warehouseId,
      planId: orderStock.planId,
      productId: orderStock.productId,
      packagingId: orderStock.packagingId,
      grammage: orderStock.grammage,
      sizeX: orderStock.sizeX,
      sizeY: orderStock.sizeY,
      paperColorGroupId: orderStock.paperColorGroupId,
      paperColorId: orderStock.paperColorId,
      paperPatternId: orderStock.paperPatternId,
      paperCertId: orderStock.paperCertId,
      quantity: orderStock.quantity,
    });

    const dstPlan = await tx.plan.create({
      data: {
        planNo: ulid(),
        type: 'TRADE_NORMAL_SELLER',
        company: {
          connect: {
            id: orderStock.order.dstCompanyId,
          },
        },
        orderStock: {
          connect: {
            id: orderStock.id,
          },
        },
      },
    });

    // 재고 할당
    const stock = await tx.stock.create({
      data: {
        serial: ulid(),
        companyId: orderStock.companyId,
        initialPlanId: dstPlan.id,
        warehouseId: orderStock.warehouseId,
        planId: orderStock.planId,
        productId: orderStock.productId,
        packagingId: orderStock.packagingId,
        grammage: orderStock.grammage,
        sizeX: orderStock.sizeX,
        sizeY: orderStock.sizeY,
        paperColorGroupId: orderStock.paperColorGroupId,
        paperColorId: orderStock.paperColorId,
        paperPatternId: orderStock.paperPatternId,
        paperCertId: orderStock.paperCertId,
        cachedQuantityAvailable: -orderStock.quantity,
      },
      select: {
        id: true,
      },
    });

    await tx.stockEvent.create({
      data: {
        stock: {
          connect: {
            id: stock.id,
          },
        },
        change: -orderStock.quantity,
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
  }

  private async cancelAssignStockTx(
    tx: PrismaTransaction,
    planId: number,
    deletePlan: boolean,
  ) {
    const plan = await tx.plan.findUnique({
      where: {
        id: planId,
      },
      select: {
        assignStockEvent: true,
      },
    });

    if (plan.assignStockEvent) {
      await tx.stockEvent.update({
        where: {
          id: plan.assignStockEvent.id,
        },
        data: {
          status: 'CANCELLED',
        },
      });

      await this.stockChangeService.cacheStockQuantityTx(tx, {
        id: plan.assignStockEvent.stockId,
      });

      await tx.plan.update({
        where: {
          id: planId,
        },
        data: {
          assignStockEvent: {
            disconnect: true,
          },
        },
      });
    }

    if (deletePlan) {
      await tx.plan.update({
        where: {
          id: planId,
        },
        data: {
          isDeleted: true,
        },
      });
    }
  }

  async getOrderCreateResponseTx(
    tx: PrismaTransaction,
    id: number,
  ): Promise<Model.Order> {
    const result = await tx.order.findUnique({
      select: ORDER,
      where: {
        id: id,
      },
    });

    return Util.serialize(result);
  }

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
    orderDate: string;
    isDirectShipping: boolean;
  }): Promise<Model.Order> {
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

    const order = await this.prisma.$transaction(async (tx) => {
      // 판매자가 사용거래처인 경우 부모재고 수량 조회
      const dstCompany = await tx.company.findUnique({
        where: {
          id: params.dstCompanyId,
        },
      });
      if (dstCompany.managedById === null) {
        await this.stockQuantityChecker.checkStockGroupAvailableQuantityTx(tx, {
          inquiryCompanyId: params.isOffer
            ? params.dstCompanyId
            : params.srcCompanyId,
          companyId: params.dstCompanyId,
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
          quantity: params.quantity,
        });
      }

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
          orderDate: params.orderDate,
          orderStock: {
            create: {
              isDirectShipping: params.isOffer
                ? false
                : params.isDirectShipping,
              dstLocationId: params.locationId,
              wantedDate: params.wantedDate,
              companyId: params.dstCompanyId,
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
              quantity: params.quantity,
            },
          },
        },
        select: {
          id: true,
        },
      });

      // 주문금액 생성
      await tx.tradePrice.create({
        data: {
          order: {
            connect: {
              id: order.id,
            },
          },
          company: {
            connect: {
              id: params.srcCompanyId,
            },
          },
          orderStockTradePrice: {
            create: {
              officialPriceUnit: PriceUnit.WON_PER_TON,
              unitPriceUnit: PriceUnit.WON_PER_TON,
            },
          },
        },
      });

      await tx.tradePrice.create({
        data: {
          order: {
            connect: {
              id: order.id,
            },
          },
          company: {
            connect: {
              id: params.dstCompanyId,
            },
          },
          orderStockTradePrice: {
            create: {
              officialPriceUnit: PriceUnit.WON_PER_TON,
              unitPriceUnit: PriceUnit.WON_PER_TON,
            },
          },
        },
      });

      return this.getOrderCreateResponseTx(tx, order.id);
    });

    return order;
  }

  async updateOrder(params: {
    companyId: number;
    orderId: number;
    locationId: number;
    memo: string;
    wantedDate: string;
    orderDate: string;
    isDirectShipping: boolean;
  }) {
    return await this.prisma.$transaction(async (tx) => {
      // 주문 업데이트
      const order = await tx.order.update({
        where: {
          id: params.orderId,
        },
        data: {
          memo: params.memo,
          orderDate: params.orderDate,
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
          wantedDate: params.wantedDate,
          dstLocationId: params.locationId,
          isDirectShipping:
            order.srcCompanyId === params.companyId
              ? params.isDirectShipping
              : undefined,
        },
        select: {
          id: true,
        },
      });

      await this.updateOrderRevisionTx(tx, order.id);

      return {
        orderId: order.id,
        orderStockId: orderStock.id,
      };
    });
  }

  /** 원지를 업데이트합니다 */
  async updateOrderAssignStock(params: {
    companyId: number;
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
          orderType: true,
          status: true,
          orderStock: true,
        },
      });
      if (!order) throw new NotFoundException(`존재하지 않는 주문입니다.`);
      if (order.orderType !== 'NORMAL')
        throw new ConflictException(`거래타입이 맞지 않습니다.`);
      if (!Util.inc(order.status, 'OFFER_PREPARING', 'ORDER_PREPARING')) {
        throw new ConflictException(`Invalid Order Status`);
      }

      // 재고 체크
      await this.stockQuantityChecker.checkStockGroupAvailableQuantityTx(tx, {
        inquiryCompanyId: params.companyId,
        companyId: order.dstCompanyId,
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
        quantity: params.quantity,
      });

      // 원지정보 업데이트
      await tx.orderStock.update({
        where: {
          id: order.orderStock.id,
        },
        data: {
          companyId: order.dstCompanyId,
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
          quantity: params.quantity,
        },
      });

      await this.updateOrderRevisionTx(tx, params.orderId);
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

  async request(params: { companyId: number; orderId: number }) {
    const { companyId, orderId } = params;

    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: {
          id: orderId,
        },
        select: {
          status: true,
          orderType: true,
          orderStock: true,
          srcCompanyId: true,
          dstCompanyId: true,
        },
      });

      if (!Util.inc(order.status, 'OFFER_PREPARING', 'ORDER_PREPARING')) {
        throw new Error('Invalid order status');
      }

      switch (order.orderType) {
        case OrderType.NORMAL:
          if (order.status === 'OFFER_PREPARING') {
            // 판매자가 요청 보낼시 재고 가용수량 차감(plan 생성)
            await this.assignStockToNormalOrder(tx, companyId, orderId);
          } else if (order.status === 'ORDER_PREPARING') {
            // 구매자가 요청 보낼시 재고수량만 체크
            await this.stockQuantityChecker.checkStockGroupAvailableQuantityTx(
              tx,
              {
                inquiryCompanyId: order.srcCompanyId,
                companyId: order.orderStock.companyId,
                warehouseId: order.orderStock.warehouseId,
                planId: order.orderStock.planId,
                productId: order.orderStock.productId,
                packagingId: order.orderStock.packagingId,
                grammage: order.orderStock.grammage,
                sizeX: order.orderStock.sizeX,
                sizeY: order.orderStock.sizeY,
                paperColorGroupId: order.orderStock.paperColorGroupId,
                paperColorId: order.orderStock.paperColorId,
                paperPatternId: order.orderStock.paperPatternId,
                paperCertId: order.orderStock.paperCertId,
                quantity: order.orderStock.quantity,
              },
            );
          }
          break;
        default:
          break;
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

      if (!Util.inc(order.status, 'ORDER_REQUESTED', 'OFFER_REQUESTED')) {
        throw new ConflictException(`Invaid Order Status`);
      }

      switch (order.orderType) {
        case OrderType.NORMAL:
          // 구매자가 요청한 주문 승인시 가용수량 차감 (plan 생성)
          if (order.status === 'ORDER_REQUESTED') {
            await this.assignStockToNormalOrder(
              tx,
              order.dstCompany.id,
              orderId,
            );
          }
          break;
        case OrderType.DEPOSIT:
          await this.createDeposit(
            tx,
            order.srcCompany,
            order.dstCompany,
            order.orderDeposit,
          );
          break;
        case OrderType.OUTSOURCE_PROCESS:
          // 출고 및 도착예정재고 자동 생성
          await this.acceptOrderProcessTx(tx, orderId);
          break;
        default:
          break;
      }

      await tx.order.update({
        where: {
          id: orderId,
        },
        data: {
          status: 'ACCEPTED',
        },
      });
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
      const deposit =
        (await tx.deposit.findFirst({
          where: {
            companyId: srcCompany.id,
            partnerCompanyRegistrationNumber:
              dstCompany.companyRegistrationNumber,
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
          },
        })) ||
        (await tx.deposit.create({
          data: {
            company: {
              connect: {
                id: srcCompany.id,
              },
            },
            partnerCompanyRegistrationNumber:
              dstCompany.companyRegistrationNumber,
            depositType: DepositType.PURCHASE,
            packaging: {
              connect: {
                id: orderDeposit.packagingId,
              },
            },
            product: {
              connect: {
                id: orderDeposit.productId,
              },
            },
            grammage: orderDeposit.grammage,
            sizeX: orderDeposit.sizeX,
            sizeY: orderDeposit.sizeY,
            paperColorGroup: orderDeposit.paperColorGroupId
              ? {
                  connect: {
                    id: orderDeposit.paperColorGroupId,
                  },
                }
              : undefined,
            paperColor: orderDeposit.paperColorId
              ? {
                  connect: {
                    id: orderDeposit.paperColorId,
                  },
                }
              : undefined,
            paperPattern: orderDeposit.paperPatternId
              ? {
                  connect: {
                    id: orderDeposit.paperPatternId,
                  },
                }
              : undefined,
            paperCert: orderDeposit.paperCertId
              ? {
                  connect: {
                    id: orderDeposit.paperCertId,
                  },
                }
              : undefined,
          },
        }));
      // event 생성
      await tx.depositEvent.create({
        data: {
          deposit: {
            connect: {
              id: deposit.id,
            },
          },
          change: orderDeposit.quantity,
          orderDeposit: {
            connect: {
              id: orderDeposit.id,
            },
          },
        },
      });
    }

    // dstCompany
    if (!dstCompany.managedById) {
      const partner = await tx.partner.findUnique({
        where: {
          companyId_companyRegistrationNumber: {
            companyId: dstCompany.id,
            companyRegistrationNumber: srcCompany.companyRegistrationNumber,
          },
        },
      });
      const deposit =
        (await tx.deposit.findFirst({
          where: {
            companyId: dstCompany.id,
            partnerCompanyRegistrationNumber:
              srcCompany.companyRegistrationNumber,
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
          },
        })) ||
        (await tx.deposit.create({
          data: {
            company: {
              connect: {
                id: dstCompany.id,
              },
            },
            partnerCompanyRegistrationNumber:
              srcCompany.companyRegistrationNumber,
            depositType: DepositType.SALES,
            packaging: {
              connect: {
                id: orderDeposit.packagingId,
              },
            },
            product: {
              connect: {
                id: orderDeposit.productId,
              },
            },
            grammage: orderDeposit.grammage,
            sizeX: orderDeposit.sizeX,
            sizeY: orderDeposit.sizeY,
            paperColorGroup: orderDeposit.paperColorGroupId
              ? {
                  connect: {
                    id: orderDeposit.paperColorGroupId,
                  },
                }
              : undefined,
            paperColor: orderDeposit.paperColorId
              ? {
                  connect: {
                    id: orderDeposit.paperColorId,
                  },
                }
              : undefined,
            paperPattern: orderDeposit.paperPatternId
              ? {
                  connect: {
                    id: orderDeposit.paperPatternId,
                  },
                }
              : undefined,
            paperCert: orderDeposit.paperCertId
              ? {
                  connect: {
                    id: orderDeposit.paperCertId,
                  },
                }
              : undefined,
          },
        }));
      // event 생성
      await tx.depositEvent.create({
        data: {
          deposit: {
            connect: {
              id: deposit.id,
            },
          },
          change: orderDeposit.quantity,
          orderDeposit: {
            connect: {
              id: orderDeposit.id,
            },
          },
        },
      });
    }
  }

  async acceptOrderProcessTx(tx: PrismaTransaction, orderId: number) {
    const order = await tx.order.findUnique({
      include: {
        orderProcess: {
          include: {
            plan: {
              include: {
                initialStock: {
                  include: {
                    stockEvent: true,
                  },
                },
              },
            },
          },
        },
      },
      where: {
        id: orderId,
      },
    });

    const srcPlan = order.orderProcess.plan.find(
      (plan) => plan.companyId === order.srcCompanyId,
    );
    const dstPlan = order.orderProcess.plan.find(
      (plan) => plan.companyId === order.dstCompanyId,
    );
    const stock = srcPlan.initialStock[0];
    const quantity = Math.abs(stock.stockEvent[0].change);

    // 출고 생성 (구매자)
    const task = await tx.task.create({
      data: {
        taskNo: ulid(),
        plan: {
          connect: {
            id: srcPlan.id,
          },
        },
        type: 'RELEASE',
        status: 'PREPARING',
        taskQuantity: {
          create: {
            quantity,
          },
        },
      },
    });

    // 도착예정재고 생성 (판매자)
    const targetStock = await tx.stock.create({
      data: {
        serial: ulid(), // 판매자쪽 도창예정재고 시리얼은 ulid로 만들어도 됨?
        company: {
          connect: {
            id: order.dstCompanyId,
          },
        },
        plan: {
          connect: {
            id: dstPlan.id,
          },
        },
        product: {
          connect: {
            id: stock.productId,
          },
        },
        packaging: {
          connect: {
            id: stock.packagingId,
          },
        },
        grammage: stock.grammage,
        sizeX: stock.sizeX,
        sizeY: stock.sizeY,
        paperColorGroup: stock.paperColorGroupId
          ? {
              connect: {
                id: stock.paperColorGroupId,
              },
            }
          : undefined,
        paperColor: stock.paperColorId
          ? {
              connect: {
                id: stock.paperColorId,
              },
            }
          : undefined,
        paperPattern: stock.paperPatternId
          ? {
              connect: {
                id: stock.paperPatternId,
              },
            }
          : undefined,
        paperCert: stock.paperCertId
          ? {
              connect: {
                id: stock.paperCertId,
              },
            }
          : undefined,
        cachedQuantityAvailable: quantity,
        initialPlan: {
          connect: {
            id: dstPlan.id,
          },
        },
      },
    });

    // 생성될 도착예정재고 이벤트
    const targetStockEvent = await tx.stockEvent.create({
      data: {
        change: quantity,
        status: 'PENDING',
        plan: {
          connect: {
            id: dstPlan.id,
          },
        },
        orderProcess: {
          connect: {
            id: order.orderProcess.id,
          },
        },
        stock: {
          connect: {
            id: targetStock.id,
          },
        },
      },
    });

    await this.stockChangeService.cacheStockQuantityTx(tx, {
      id: targetStock.id,
    });

    // 투입될 도착예정재고 이벤트
    const assignStock = await tx.stockEvent.create({
      data: {
        change: -quantity,
        status: 'PENDING',
        assignPlan: {
          connect: {
            id: dstPlan.id,
          },
        },
        plan: {
          connect: {
            id: dstPlan.id,
          },
        },
        stock: {
          connect: {
            id: targetStock.id,
          },
        },
      },
    });
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
          orderType: true,
          orderStock: {
            include: {
              plan: true,
            },
          },
        },
      });

      if (!Util.inc(order.status, 'OFFER_REQUESTED', 'ORDER_REQUESTED')) {
        throw new Error('Invalid order status');
      }

      switch (order.orderType) {
        case OrderType.NORMAL:
          if (order.status === 'OFFER_REQUESTED') {
            // 판매자쪽에서 요청한 주문의 경우 가용수량 원복 (plan 삭제)
            const dstPlan = order.orderStock.plan.find(
              (plan) => plan.type === 'TRADE_NORMAL_SELLER',
            );
            await this.cancelAssignStockTx(tx, dstPlan.id, true);
          }
          break;
        default:
          break;
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
          id: true,
          orderType: true,
          status: true,
          orderStock: {
            select: {
              plan: true,
            },
          },
        },
      });

      if (
        !Util.inc(
          order.status,
          'OFFER_REJECTED',
          'ORDER_REJECTED',
          'OFFER_REQUESTED',
          'ORDER_REQUESTED',
        )
      ) {
        throw new Error('Invalid order status');
      }

      switch (order.orderType) {
        case OrderType.NORMAL:
          if (order.status === 'OFFER_REQUESTED') {
            // 판매자가 요청한 주문을 되돌릴시 가용수량 원복
            const dstPlan = order.orderStock.plan.find(
              (plan) => plan.type === 'TRADE_NORMAL_SELLER',
            );
            await this.cancelAssignStockTx(tx, dstPlan.id, true);
          }
          break;
        default:
          break;
      }

      await tx.order.update({
        where: {
          id: orderId,
        },
        data: {
          status:
            order.status === 'OFFER_REJECTED' ||
            order.status === 'OFFER_REQUESTED'
              ? 'OFFER_PREPARING'
              : 'ORDER_PREPARING',
        },
      });

      await this.updateOrderRevisionTx(tx, order.id);
    });
  }

  async createArrival(params: {
    companyId: number;
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
          orderType: true,
        },
      });

      if (
        !order ||
        (order.srcCompanyId !== params.companyId &&
          order.dstCompanyId !== params.companyId)
      )
        throw new NotFoundException(`존재하지 않는 주문정보 입니다.`);

      switch (order.orderType) {
        case OrderType.NORMAL:
          await this.createArrivalToNormalTrade(tx, params);
          break;
        case OrderType.OUTSOURCE_PROCESS:
          await this.createArrivalToOutsourceProcessTrade(tx, params);
          break;
        default:
          throw new ConflictException(
            `도착예정재고를 추가할 수 없는 주문타입입니다.`,
          );
      }
    });
  }

  /** 정상거래에 도착예정재고 추가 */
  async createArrivalToNormalTrade(
    tx: PrismaTransaction,
    params: {
      companyId: number;
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
    },
  ) {
    const orderStock = await tx.orderStock.findUnique({
      include: {
        order: true,
      },
      where: {
        orderId: params.orderId,
      },
    });

    const srcPlan = await tx.plan.findFirst({
      where: {
        orderStockId: orderStock.id,
        companyId: orderStock.order.srcCompanyId,
      },
      select: {
        id: true,
        type: true,
        company: {
          select: {
            id: true,
            invoiceCode: true,
          },
        },
      },
    });

    return this.addArrivalToPlanTx(tx, srcPlan, params);
  }

  /** 외주재단에 도착예정재고 추가  */
  async createArrivalToOutsourceProcessTrade(
    tx: PrismaTransaction,
    params: {
      companyId: number;
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
    },
  ) {
    const orderProcess = await tx.orderProcess.findFirst({
      include: {
        order: true,
        plan: {
          select: {
            company: {
              select: {
                id: true,
                invoiceCode: true,
              },
            },
            id: true,
            type: true,
          },
        },
      },
      where: {
        orderId: params.orderId,
      },
    });
    if (orderProcess.order.srcCompanyId !== params.companyId)
      throw new ConflictException(
        `판매기업은 도착예정 재고를 추가할 수 없습니다.`,
      );

    const srcPlan = orderProcess.plan.find(
      (plan) => plan.type === 'TRADE_OUTSOURCE_PROCESS_BUYER',
    );

    return this.addArrivalToPlanTx(tx, srcPlan, params);
  }

  async addArrivalToPlanTx(
    tx: PrismaTransaction,
    plan: {
      company: {
        id: number;
        invoiceCode: string;
      };
      id: number;
      type: PlanType;
    },
    stockSpec: {
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
    },
  ) {
    // 구매처 작업계획의 동일한 스펙 입고예정재고 모두 취소처리
    await tx.stockEvent.updateMany({
      data: {
        status: 'CANCELLED',
      },
      where: {
        plan: {
          every: {
            id: {
              equals: plan.id,
            },
          },
        },
        stock: {
          productId: stockSpec.productId,
          packagingId: stockSpec.packagingId,
          grammage: stockSpec.grammage,
          sizeX: stockSpec.sizeX,
          sizeY: stockSpec.sizeY,
          paperColorGroupId: stockSpec.paperColorGroupId,
          paperColorId: stockSpec.paperColorId,
          paperPatternId: stockSpec.paperPatternId,
          paperCertId: stockSpec.paperCertId,
        },
        status: 'PENDING',
      },
    });

    // 새 입고 예정 재고 추가
    const stock = await tx.stock.create({
      data: {
        serial: Util.serialP(plan.company.invoiceCode),
        companyId: plan.company.id,
        planId: plan.id,
        initialPlanId: plan.id,
        productId: stockSpec.productId,
        packagingId: stockSpec.packagingId,
        grammage: stockSpec.grammage,
        sizeX: stockSpec.sizeX,
        sizeY: stockSpec.sizeY,
        paperColorGroupId: stockSpec.paperColorGroupId,
        paperColorId: stockSpec.paperColorId,
        paperPatternId: stockSpec.paperPatternId,
        paperCertId: stockSpec.paperCertId,
        cachedQuantityAvailable: stockSpec.quantity,
        stockPrice: stockSpec.isSyncPrice
          ? undefined
          : {
              create: {
                ...stockSpec.stockPrice,
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
        change: stockSpec.quantity,
        status: 'PENDING',
        plan: {
          connect: {
            id: plan.id,
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

  /** 거래금액 수정 */
  async updateTradePrice(
    companyId: number,
    orderId: number,
    params: UpdateTradePriceParams,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: {
          id: orderId,
          OR: [{ srcCompanyId: companyId }, { dstCompanyId: companyId }],
        },
      });
      if (!order) throw new NotFoundException('존재하지 않는 주문입니다');

      // // 원지 정보는 판매자(dstCompany)의 Plan에서 지정하므로 판매자의 Plan을 필터링
      // const plan = order.orderStock?.plan.find(
      //   (plan) => plan.companyId === order.dstCompanyId,
      // );

      // 금액정보 validation
      switch (order.orderType) {
        case 'NORMAL':
          await this.updateOrderStockTradePriceTx(
            tx,
            orderId,
            companyId,
            params.orderStockTradePrice,
          );
          break;
        case 'DEPOSIT':
          await this.updateOrderDepositTradePriceTx(
            tx,
            orderId,
            companyId,
            params.orderDepositTradePrice,
          );
          break;
        // TODO... 외주배송, 기타매입/매출 등
      }
    });
  }

  async updateOrderStockTradePriceTx(
    tx: PrismaTransaction,
    orderId: number,
    companyId: number,
    orderStockTradePrice: OrderStockTradePrice,
  ) {
    const order = await tx.order.findUnique({
      include: {
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
        tradePrice: {
          include: {
            orderStockTradePrice: {
              include: {
                orderStockTradeAltBundle: true,
              },
            },
          },
        },
      },
      where: {
        id: orderId,
      },
    });

    this.tradePriceValidator.validateOrderStockTradePrice(
      // 판매자가 배정한 재고(원지) 기준으로 validation
      order.orderStock.plan.find(
        (plan) => plan.companyId === order.dstCompanyId,
      ).assignStockEvent.stock.packaging.type,
      orderStockTradePrice,
    );

    const tradePrice =
      order.tradePrice.find(
        (tp) => tp.orderStockTradePrice.companyId === companyId,
      ) || null;
    // 기존 금액 삭제
    if (tradePrice.orderStockTradePrice.orderStockTradeAltBundle) {
      await tx.orderStockTradeAltBundle.delete({
        where: {
          orderId_companyId: {
            orderId,
            companyId,
          },
        },
      });
    }
    await tx.orderStockTradePrice.delete({
      where: {
        orderId_companyId: {
          orderId,
          companyId,
        },
      },
    });
    await tx.tradePrice.delete({
      where: {
        orderId_companyId: {
          orderId,
          companyId,
        },
      },
    });
    // 금액 생성
    await tx.tradePrice.create({
      data: {
        order: {
          connect: {
            id: orderId,
          },
        },
        company: {
          connect: {
            id: companyId,
          },
        },
        orderStockTradePrice: {
          create: {
            officialPriceType: orderStockTradePrice.officialPriceType,
            officialPrice: orderStockTradePrice.officialPrice,
            officialPriceUnit: orderStockTradePrice.officialPriceUnit,
            discountType: orderStockTradePrice.discountType,
            discountPrice: orderStockTradePrice.discountPrice,
            unitPrice: orderStockTradePrice.unitPrice,
            unitPriceUnit: orderStockTradePrice.unitPriceUnit,
            processPrice: orderStockTradePrice.processPrice,
            orderStockTradeAltBundle:
              orderStockTradePrice.orderStockTradeAltBundle
                ? {
                    create: {
                      altSizeX:
                        orderStockTradePrice.orderStockTradeAltBundle.altSizeX,
                      altSizeY:
                        orderStockTradePrice.orderStockTradeAltBundle.altSizeY,
                      altQuantity:
                        orderStockTradePrice.orderStockTradeAltBundle
                          .altQuantity,
                    },
                  }
                : undefined,
          },
        },
      },
    });
  }

  async updateOrderDepositTradePriceTx(
    tx: PrismaTransaction,
    orderId: number,
    companyId: number,
    orderDepositTradePrice: OrderDepositTradePrice,
  ) {
    const order = await tx.order.findUnique({
      include: {
        orderDeposit: {
          include: {
            packaging: true,
          },
        },
        tradePrice: {
          include: {
            orderDepositTradePrice: {
              include: {
                orderDepositTradeAltBundle: true,
              },
            },
          },
        },
      },
      where: {
        id: orderId,
      },
    });

    this.tradePriceValidator.validateOrderDepositTradePrice(
      order.orderDeposit.packaging.type,
      orderDepositTradePrice,
    );

    const tradePrice =
      order.tradePrice.find(
        (tp) => tp.orderDepositTradePrice.companyId === companyId,
      ) || null;
    // 기존 금액 삭제
    if (tradePrice.orderDepositTradePrice.orderDepositTradeAltBundle) {
      await tx.orderDepositTradeAltBundle.delete({
        where: {
          orderId_companyId: {
            orderId,
            companyId,
          },
        },
      });
    }
    await tx.orderDepositTradePrice.delete({
      where: {
        orderId_companyId: {
          orderId,
          companyId,
        },
      },
    });
    await tx.tradePrice.delete({
      where: {
        orderId_companyId: {
          orderId,
          companyId,
        },
      },
    });
    // 금액 생성
    await tx.tradePrice.create({
      data: {
        order: {
          connect: {
            id: orderId,
          },
        },
        company: {
          connect: {
            id: companyId,
          },
        },
        orderDepositTradePrice: {
          create: {
            officialPriceType: orderDepositTradePrice.officialPriceType,
            officialPrice: orderDepositTradePrice.officialPrice,
            officialPriceUnit: orderDepositTradePrice.officialPriceUnit,
            discountType: orderDepositTradePrice.discountType,
            discountPrice: orderDepositTradePrice.discountPrice,
            unitPrice: orderDepositTradePrice.unitPrice,
            unitPriceUnit: orderDepositTradePrice.unitPriceUnit,
            processPrice: orderDepositTradePrice.processPrice,
            orderDepositTradeAltBundle:
              orderDepositTradePrice.orderStockTradeAltBundle
                ? {
                    create: {
                      altSizeX:
                        orderDepositTradePrice.orderStockTradeAltBundle
                          .altSizeX,
                      altSizeY:
                        orderDepositTradePrice.orderStockTradeAltBundle
                          .altSizeY,
                      altQuantity:
                        orderDepositTradePrice.orderStockTradeAltBundle
                          .altQuantity,
                    },
                  }
                : undefined,
          },
        },
      },
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
    orderDate: string,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const businessRelationship = tx.businessRelationship.findUnique({
        where: {
          srcCompanyId_dstCompanyId: {
            srcCompanyId,
            dstCompanyId,
          },
        },
      });
      if (!businessRelationship)
        throw new ConflictException(`올바른 매입/매출관계가 아닙니다.`);

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
          orderDate,
          orderDeposit: {
            create: {
              packaging: {
                connect: {
                  id: packagingId,
                },
              },
              product: {
                connect: {
                  id: productId,
                },
              },
              grammage,
              sizeX,
              sizeY,
              paperColorGroup: paperColorGroupId
                ? {
                    connect: {
                      id: paperColorGroupId,
                    },
                  }
                : undefined,
              paperColor: paperColorId
                ? {
                    connect: {
                      id: paperColorId,
                    },
                  }
                : undefined,
              paperPattern: paperPatternId
                ? {
                    connect: {
                      id: paperPatternId,
                    },
                  }
                : undefined,
              paperCert: paperCertId
                ? {
                    connect: {
                      id: paperCertId,
                    },
                  }
                : undefined,
              quantity,
            },
          },
        },
      });

      // 주문금액 생성
      await tx.tradePrice.create({
        data: {
          order: {
            connect: {
              id: order.id,
            },
          },
          company: {
            connect: {
              id: srcCompanyId,
            },
          },
          orderDepositTradePrice: {
            create: {
              officialPriceUnit: PriceUnit.WON_PER_TON,
              unitPriceUnit: PriceUnit.WON_PER_TON,
            },
          },
        },
      });

      await tx.tradePrice.create({
        data: {
          order: {
            connect: {
              id: order.id,
            },
          },
          company: {
            connect: {
              id: dstCompanyId,
            },
          },
          orderDepositTradePrice: {
            create: {
              officialPriceUnit: PriceUnit.WON_PER_TON,
              unitPriceUnit: PriceUnit.WON_PER_TON,
            },
          },
        },
      });
    });
  }

  async createOrderDeposit(
    companyId: number,
    orderId: number,
    depositId: number,
    quantity: number,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        include: {
          srcCompany: true,
          dstCompany: true,
          srcDepositEvent: true,
          dstDepositEvent: true,
          orderDeposit: {
            include: {
              depositEvent: {
                include: {
                  deposit: true,
                },
              },
            },
          },
        },
        where: {
          id: orderId,
        },
      });
      if (
        !order ||
        order.orderType !== 'NORMAL' ||
        (order.srcCompanyId !== companyId && order.dstCompanyId !== companyId)
      )
        throw new NotFoundException(`주문이 존재하지 않습니다.`);

      const isSrcCompany = order.srcCompanyId === companyId;
      if (
        (isSrcCompany && order.srcDepositEvent) ||
        (!isSrcCompany && order.dstDepositEvent)
      )
        throw new ConflictException(`이미 차감할 보관이 등록되어 있습니다.`);

      const deposit = await tx.deposit.findUnique({
        where: {
          id: depositId,
        },
      });
      if (
        !deposit ||
        deposit.companyId !== companyId ||
        (isSrcCompany && deposit.depositType !== DepositType.PURCHASE) ||
        (!isSrcCompany && deposit.depositType !== DepositType.SALES) ||
        deposit.partnerCompanyRegistrationNumber !==
          (isSrcCompany
            ? order.dstCompany.companyRegistrationNumber
            : order.srcCompany.companyRegistrationNumber)
      ) {
        throw new NotFoundException(`존재하지 않는 보관입니다.`);
      }

      await tx.depositEvent.create({
        data: {
          deposit: {
            connect: {
              id: depositId,
            },
          },
          change: -quantity,
          srcOrder: isSrcCompany
            ? {
                connect: {
                  id: orderId,
                },
              }
            : undefined,
          dstOrder: !isSrcCompany
            ? {
                connect: {
                  id: orderId,
                },
              }
            : undefined,
        },
      });
    });
  }

  async updateOrderDeposit(
    companyId: number,
    orderId: number,
    depositId: number,
    quantity: number,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        include: {
          srcCompany: true,
          dstCompany: true,
          srcDepositEvent: true,
          dstDepositEvent: true,
          orderDeposit: {
            include: {
              depositEvent: {
                include: {
                  deposit: true,
                },
              },
            },
          },
        },
        where: {
          id: orderId,
        },
      });
      if (
        !order ||
        order.orderType !== 'NORMAL' ||
        (order.srcCompanyId !== companyId && order.dstCompanyId !== companyId)
      )
        throw new NotFoundException(`주문이 존재하지 않습니다.`);

      const isSrcCompany = order.srcCompanyId === companyId;
      const deposit = await tx.deposit.findUnique({
        where: {
          id: depositId,
        },
      });
      if (
        !deposit ||
        deposit.companyId !== companyId ||
        (isSrcCompany && deposit.depositType !== DepositType.PURCHASE) ||
        (!isSrcCompany && deposit.depositType !== DepositType.SALES) ||
        deposit.partnerCompanyRegistrationNumber !==
          (isSrcCompany
            ? order.dstCompany.companyRegistrationNumber
            : order.srcCompany.companyRegistrationNumber)
      ) {
        throw new NotFoundException(`존재하지 않는 보관입니다.`);
      }

      const depositEvent = isSrcCompany
        ? order.srcDepositEvent
        : order.dstDepositEvent;
      if (depositEvent) {
        await tx.depositEvent.update({
          data: {
            status: DepositEventStatus.CANCELLED,
            srcOrder: isSrcCompany
              ? {
                  disconnect: {
                    id: orderId,
                  },
                }
              : undefined,
            dstOrder: !isSrcCompany
              ? {
                  disconnect: {
                    id: orderId,
                  },
                }
              : undefined,
          },
          where: {
            id: depositEvent.id,
          },
        });

        await tx.depositEvent.create({
          data: {
            deposit: {
              connect: {
                id: depositId,
              },
            },
            change: -quantity,
            srcOrder: isSrcCompany
              ? {
                  connect: {
                    id: orderId,
                  },
                }
              : undefined,
            dstOrder: !isSrcCompany
              ? {
                  connect: {
                    id: orderId,
                  },
                }
              : undefined,
          },
        });
      } else {
        await tx.depositEvent.create({
          data: {
            deposit: {
              connect: {
                id: depositId,
              },
            },
            change: -quantity,
            srcOrder: isSrcCompany
              ? {
                  connect: {
                    id: orderId,
                  },
                }
              : undefined,
            dstOrder: !isSrcCompany
              ? {
                  connect: {
                    id: orderId,
                  },
                }
              : undefined,
          },
        });
      }

      await this.updateOrderRevisionTx(tx, orderId);
    });
  }

  async deleteOrderDeposit(companyId: number, orderId: number) {
    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        include: {
          srcCompany: true,
          dstCompany: true,
          srcDepositEvent: true,
          dstDepositEvent: true,
          orderDeposit: {
            include: {
              depositEvent: {
                include: {
                  deposit: true,
                },
              },
            },
          },
        },
        where: {
          id: orderId,
        },
      });
      if (
        !order ||
        order.orderType !== 'NORMAL' ||
        (order.srcCompanyId !== companyId && order.dstCompanyId !== companyId)
      )
        throw new NotFoundException(`주문이 존재하지 않습니다.`);

      const isSrcCompany = order.srcCompanyId === companyId;
      if (
        (isSrcCompany && !order.srcDepositEvent) ||
        (!isSrcCompany && !order.dstDepositEvent)
      )
        throw new ConflictException(`보관이 등록되어 있지 않습니다.`);

      const depositEvent = isSrcCompany
        ? order.srcDepositEvent
        : order.dstDepositEvent;
      await tx.depositEvent.update({
        data: {
          status: DepositEventStatus.CANCELLED,
          srcOrder: isSrcCompany
            ? {
                disconnect: {
                  id: orderId,
                },
              }
            : undefined,
          dstOrder: !isSrcCompany
            ? {
                disconnect: {
                  id: orderId,
                },
              }
            : undefined,
        },
        where: {
          id: depositEvent.id,
        },
      });
    });
  }

  /** 외주공정 */
  async createOrderProcess(params: {
    companyId: number;
    srcCompanyId: number;
    dstCompanyId: number;
    srcLocationId: number;
    dstLocationId: number;
    memo: string;
    srcWantedDate: string;
    dstWantedDate: string;
    // 부모재고 선택
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
    orderDate: string;
    isSrcDirectShipping: boolean;
    isDstDirectShipping: boolean;
  }): Promise<Model.Order> {
    const {
      companyId,
      srcCompanyId,
      dstCompanyId,
      srcLocationId,
      dstLocationId,
      memo,
      srcWantedDate,
      dstWantedDate,
      warehouseId,
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
      quantity,
      orderDate,
      isDstDirectShipping,
      isSrcDirectShipping,
    } = params;

    const order = await this.prisma.$transaction(async (tx) => {
      if (companyId !== srcCompanyId && companyId !== dstCompanyId)
        throw new BadRequestException(`잘못된 주문입니다.`);

      // 매출등록은 상대방이 미사용인경우에만 가능
      if (companyId !== srcCompanyId) {
        const srcCompany = await tx.company.findUnique({
          where: {
            id: srcCompanyId,
          },
        });
        if (!srcCompany)
          throw new BadRequestException(`존재하지 않는 거래처입니다.`);
        if (srcCompany.managedById === null)
          throw new BadRequestException(
            `페이퍼웨어 사용중인 기업에는 외주공정매출을 등록할 수 없습니다.`,
          );
      }

      // TODO: 거래처 확인
      // TODO: 도착지 확인

      // 재고 가용수량 확인
      await this.stockQuantityChecker.checkStockGroupAvailableQuantityTx(tx, {
        inquiryCompanyId: companyId,
        companyId: srcCompanyId,
        warehouseId,
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
        quantity,
      });

      const order = await tx.order.create({
        select: {
          id: true,
          srcCompanyId: true,
          dstCompanyId: true,
          orderProcess: {
            select: {
              plan: true,
            },
          },
        },
        data: {
          orderType: 'OUTSOURCE_PROCESS',
          orderNo: ulid(),
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
          status:
            srcCompanyId === companyId ? 'ORDER_PREPARING' : 'OFFER_PREPARING',
          isEntrusted: srcCompanyId !== companyId,
          memo,
          orderDate,
          orderProcess: {
            create: {
              srcLocation: {
                connect: {
                  id: srcLocationId,
                },
              },
              dstLocation: {
                connect: {
                  id: dstLocationId,
                },
              },
              srcWantedDate,
              dstWantedDate,
              isDstDirectShipping:
                companyId === dstCompanyId ? isDstDirectShipping : undefined,
              isSrcDirectShipping:
                companyId === srcCompanyId ? isSrcDirectShipping : undefined,
              // 원지 정보
              company: {
                connect: {
                  id: srcCompanyId,
                },
              },
              warehouse: {
                connect: {
                  id: warehouseId,
                },
              },
              planId,
              product: {
                connect: {
                  id: productId,
                },
              },
              packaging: {
                connect: {
                  id: packagingId,
                },
              },
              grammage,
              sizeX,
              sizeY,
              paperColorGroup: paperColorGroupId
                ? {
                    connect: {
                      id: paperColorGroupId,
                    },
                  }
                : undefined,
              paperColor: paperColorId
                ? {
                    connect: {
                      id: paperColorId,
                    },
                  }
                : undefined,
              paperPattern: paperPatternId
                ? {
                    connect: {
                      id: paperColorGroupId,
                    },
                  }
                : undefined,
              paperCert: paperCertId
                ? {
                    connect: {
                      id: paperColorGroupId,
                    },
                  }
                : undefined,
              quantity,
            },
          },
        },
      });

      return await this.getOrderCreateResponseTx(tx, order.id);
    });

    return order;
  }

  /** 외주공정 수정 */
  async updateOrderProcessInfo(params: {
    companyId: number;
    orderId: number;
    srcLocationId: number;
    dstLocationId: number;
    memo: string;
    srcWantedDate: string;
    dstWantedDate: string;
    orderDate: string;
    isSrcDirectShipping: boolean;
    isDstDirectShipping: boolean;
  }): Promise<Model.Order> {
    const order = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        include: {
          orderProcess: true,
          srcCompany: true,
          dstCompany: true,
        },
        where: {
          id: params.orderId,
        },
      });
      if (
        !order ||
        (order.srcCompanyId !== params.companyId &&
          order.dstCompanyId !== params.companyId)
      )
        throw new NotFoundException(`존재하지 않는 주문입니다.`);
      if (order.orderType !== 'OUTSOURCE_PROCESS')
        throw new ConflictException(
          `잘못된 요청입니다. 주문타입을 확인해주세요`,
        );

      // TODO: 도착지 확인

      if (
        params.companyId !== order.dstCompanyId &&
        order.dstCompany.managedById === null
      )
        throw new ConflictException(
          `주문정보 수정은 판매기업에 요청해야합니다.`,
        );

      await tx.orderProcess.update({
        data: {
          srcLocation: {
            connect: {
              id: params.srcLocationId,
            },
          },
          dstLocation: {
            connect: {
              id: params.dstLocationId,
            },
          },
          srcWantedDate: params.srcWantedDate,
          dstWantedDate: params.dstWantedDate,
          isDstDirectShipping:
            params.companyId === order.dstCompanyId
              ? params.isDstDirectShipping
              : undefined,
          isSrcDirectShipping:
            params.companyId === order.srcCompanyId
              ? params.isSrcDirectShipping
              : undefined,
        },
        where: {
          id: order.orderProcess.id,
        },
      });
      await tx.order.update({
        data: {
          memo: params.memo,
          orderDate: params.orderDate,
        },
        where: {
          id: params.orderId,
        },
      });

      await this.updateOrderRevisionTx(tx, order.id);

      return await this.getOrderCreateResponseTx(tx, order.id);
    });

    return order;
  }

  /** 외주공정 원지 수정 */
  async updateOrderProcessStock(params: {
    companyId: number;
    orderId: number;
    warehouseId: number;
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
    quantity: number;
  }): Promise<Model.Order> {
    const {
      companyId,
      orderId,
      warehouseId,
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
      quantity,
    } = params;

    const order = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        include: {
          orderProcess: {
            include: {
              plan: {
                include: {
                  assignStockEvent: true,
                  targetStockEvent: true,
                },
              },
            },
          },
          srcCompany: true,
          dstCompany: true,
        },
        where: {
          id: params.orderId,
        },
      });
      if (
        !order ||
        (order.srcCompanyId !== params.companyId &&
          order.dstCompanyId !== params.companyId)
      )
        throw new NotFoundException(`존재하지 않는 주문입니다.`);
      if (order.orderType !== 'OUTSOURCE_PROCESS')
        throw new ConflictException(
          `잘못된 요청입니다. 주문타입을 확인해주세요`,
        );
      if (
        params.companyId !== order.srcCompanyId &&
        order.srcCompany.managedById === null
      )
        throw new BadRequestException(`원지정보 변경은 구매기업만 가능합니다.`);

      // TODO: 원지 가용수량 체크 (판매자가 사용중일때만)

      switch (order.status) {
        case 'OFFER_PREPARING':
        case 'ORDER_PREPARING':
          break;
        default:
          throw new ConflictException(
            `원지 정보를 수정 불가능한 주문상태 입니다.`,
          );
      }

      const srcPlan = order.orderProcess.plan.find(
        (plan) => order.srcCompanyId === plan.companyId,
      );

      // 기존 event취소
      await tx.stockEvent.update({
        data: {
          status: 'CANCELLED',
        },
        where: {
          id: srcPlan.assignStockEvent.id,
        },
      });

      // assign stock 새로 생성
      const stock = await tx.stock.create({
        include: {
          stockEvent: true,
        },
        data: {
          serial: ulid(), // 부모재고선택용 재고는 serial을 이렇게 만들어도 되는건지?
          initialPlan: {
            connect: {
              id: srcPlan.id,
            },
          },
          company: {
            connect: {
              id: order.srcCompanyId,
            },
          },
          warehouse: warehouseId
            ? {
                connect: {
                  id: warehouseId,
                },
              }
            : undefined,
          plan: planId
            ? {
                connect: {
                  id: planId,
                },
              }
            : undefined,
          product: {
            connect: {
              id: productId,
            },
          },
          packaging: {
            connect: {
              id: packagingId,
            },
          },
          grammage,
          sizeX,
          sizeY,
          paperColorGroup: paperColorGroupId
            ? {
                connect: {
                  id: paperColorGroupId,
                },
              }
            : undefined,
          paperColor: paperColorId
            ? {
                connect: {
                  id: paperColorId,
                },
              }
            : undefined,
          paperPattern: paperPatternId
            ? {
                connect: {
                  id: paperPatternId,
                },
              }
            : undefined,
          paperCert: paperCertId
            ? {
                connect: {
                  id: paperCertId,
                },
              }
            : undefined,
          stockEvent: {
            create: {
              change: -quantity,
              status: 'PENDING',
            },
          },
        },
      });

      await tx.plan.update({
        data: {
          assignStockEvent: {
            connect: {
              id: stock.stockEvent[0].id,
            },
          },
        },
        where: {
          id: srcPlan.id,
        },
      });

      await this.updateOrderRevisionTx(tx, order.id);

      return await this.getOrderCreateResponseTx(tx, order.id);
    });

    return order;
  }

  /** 기타거래 */
  async createOrderEtc(params: {
    companyId: number;
    srcCompanyId: number;
    dstCompanyId: number;
    item: string;
    memo: string;
    orderDate: string;
  }): Promise<Model.Order> {
    const { companyId, srcCompanyId, dstCompanyId, item, memo } = params;
    const order = await this.prisma.$transaction(async (tx) => {
      if (companyId !== srcCompanyId && companyId !== dstCompanyId)
        throw new BadRequestException(`잘못된 주문입니다.`);

      // TODO: 거래처 확인

      const order = await tx.order.create({
        include: {
          srcCompany: true,
          dstCompany: true,
          orderEtc: true,
        },
        data: {
          orderType: 'ETC',
          orderNo: ulid(),
          orderDate: params.orderDate,
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
          status:
            srcCompanyId === companyId ? 'ORDER_PREPARING' : 'OFFER_PREPARING',
          isEntrusted: srcCompanyId !== companyId,
          memo,
          orderEtc: {
            create: {
              item,
            },
          },
        },
      });

      return await this.getOrderCreateResponseTx(tx, order.id);
    });

    return order;
  }

  async updateOrderEtc(params: {
    companyId: number;
    orderId: number;
    memo: string;
    item: string;
    orderDate: string;
  }) {
    const order = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        include: {
          orderEtc: true,
          srcCompany: true,
          dstCompany: true,
        },
        where: {
          id: params.orderId,
        },
      });
      if (
        !order ||
        (order.srcCompanyId !== params.companyId &&
          order.dstCompanyId !== params.companyId)
      )
        throw new NotFoundException(`존재하지 않는 주문입니다.`);
      if (order.orderType !== 'ETC')
        throw new ConflictException(
          `잘못된 요청입니다. 주문타입을 확인해주세요`,
        );
      if (
        params.companyId !== order.dstCompanyId &&
        order.dstCompany.managedById === null
      )
        throw new BadRequestException(
          `주문정보 변경은 판매기업에 요청해주세요.`,
        );

      await tx.order.update({
        data: {
          memo: params.memo,
          orderDate: params.orderDate,
        },
        where: {
          id: order.id,
        },
      });
      await tx.orderEtc.update({
        data: {
          item: params.item,
        },
        where: {
          id: order.orderEtc.id,
        },
      });

      await this.updateOrderRevisionTx(tx, order.id);

      return await this.getOrderCreateResponseTx(tx, order.id);
    });
    return order;
  }
}
