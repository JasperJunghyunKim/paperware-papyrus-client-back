import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import {
  Company,
  DepositEventStatus,
  DiscountType,
  OfficialPriceType,
  OrderDeposit,
  OrderStatus,
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
import { PlanChangeService } from 'src/modules/working/service/plan-change.service';
import { OrderRetriveService } from './order-retrive.service';

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
  isSyncPrice: boolean;
  orderStockTradePrice: OrderStockTradePrice | null;
  orderDepositTradePrice: OrderDepositTradePrice | null;
}

@Injectable()
export class OrderChangeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderRetriveService: OrderRetriveService,
    private readonly tradePriceValidator: TradePriceValidator,
    private readonly depositChangeService: DepositChangeService,
    private readonly stockChangeService: StockChangeService,
    private readonly stockQuantityChecker: StockQuantityChecker,
    private readonly planChangeService: PlanChangeService,
  ) {}

  private async updateOrderRevisionTx(tx: PrismaTransaction, orderId: number) {
    await tx.$queryRaw`UPDATE \`Order\` SET revision = revision + 1 WHERE id = ${orderId}`;
  }

  private validateUpdateOrder(params: {
    companyId: number;
    orderStatus: OrderStatus;
    srcCompany: Company;
    dstCompany: Company;
    curWantedDate1: string;
    wantedDate1: string;
    curWantedDate2: string | null;
    wantedDate2: string | null;
    curLocationId1: number | null;
    locationId1: number | null;
    curLocationId2: number | null;
    locationId2: number | null;
    curIsDirectShipping1: boolean | null;
    isDirectShipping1: boolean | null;
    curIsDirectShipping2: boolean | null;
    isDirectShipping2: boolean | null;
    curMemo: string;
    memo: string;
  }) {
    // 주문승인후 + 판매회사 아님 + 판매회사가 사용중
    if (
      Util.inc(params.orderStatus, 'ACCEPTED') &&
      params.companyId !== params.dstCompany.id &&
      params.dstCompany.managedById === null
    ) {
      // 1. 거래일
      if (
        params.curWantedDate1 !== params.wantedDate1 ||
        params.curWantedDate2 !== params.wantedDate2
      ) {
        throw new ForbiddenException(`거래일 수정은 판매회사만 가능합니다.`);
      }

      // 2. 도착지
      if (
        params.locationId1 !== params.curLocationId1 ||
        params.locationId2 !== params.curLocationId2
      ) {
        throw new ForbiddenException(`도착지 수정은 판매회사만 가능합니다.`);
      }

      // 3. 납품요청일
      if (
        params.wantedDate1 !== params.curWantedDate1 ||
        params.wantedDate2 !== params.curWantedDate2
      ) {
        throw new ForbiddenException(
          `납품요청일 수정은 판매회사만 가능합니다.`,
        );
      }

      // 4. 비고
      if (params.memo !== params.curMemo) {
        throw new ForbiddenException(`비고 수정은 판매회사만 가능합니다.`);
      }
    }
  }

  private async assignStockToNormalOrder(
    tx: PrismaTransaction,
    inquiryCompanyId: number,
    orderId: number,
  ) {
    const orderStock = await tx.orderStock.findUnique({
      include: {
        order: true,
        company: true,
      },
      where: {
        orderId,
      },
    });

    // 판매처가 사용중인 경우 재고 체크
    if (orderStock.company.managedById === null) {
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
    }

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
        plan: {
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

  private async assignStockToProcessOrder(
    tx: PrismaTransaction,
    inquiryCompanyId: number,
    orderId: number,
  ) {
    const orderProcess = await tx.orderProcess.findUnique({
      include: {
        order: true,
        company: true,
      },
      where: {
        orderId,
      },
    });

    // 판매처가 사용중인 경우 재고 체크
    if (orderProcess.company.managedById === null) {
      await this.stockQuantityChecker.checkStockGroupAvailableQuantityTx(tx, {
        inquiryCompanyId,
        companyId: orderProcess.companyId,
        warehouseId: orderProcess.warehouseId,
        planId: orderProcess.planId,
        productId: orderProcess.productId,
        packagingId: orderProcess.packagingId,
        grammage: orderProcess.grammage,
        sizeX: orderProcess.sizeX,
        sizeY: orderProcess.sizeY,
        paperColorGroupId: orderProcess.paperColorGroupId,
        paperColorId: orderProcess.paperColorId,
        paperPatternId: orderProcess.paperPatternId,
        paperCertId: orderProcess.paperCertId,
        quantity: orderProcess.quantity,
      });
    }

    const srcPlan = await tx.plan.create({
      data: {
        planNo: ulid(),
        type: 'TRADE_OUTSOURCE_PROCESS_BUYER',
        company: {
          connect: {
            id: orderProcess.order.srcCompanyId,
          },
        },
        orderProcess: {
          connect: {
            id: orderProcess.id,
          },
        },
      },
    });

    // 재고 할당
    const stock = await tx.stock.create({
      data: {
        serial: ulid(),
        companyId: orderProcess.companyId,
        initialPlanId: srcPlan.id,
        warehouseId: orderProcess.warehouseId,
        planId: orderProcess.planId,
        productId: orderProcess.productId,
        packagingId: orderProcess.packagingId,
        grammage: orderProcess.grammage,
        sizeX: orderProcess.sizeX,
        sizeY: orderProcess.sizeY,
        paperColorGroupId: orderProcess.paperColorGroupId,
        paperColorId: orderProcess.paperColorId,
        paperPatternId: orderProcess.paperPatternId,
        paperCertId: orderProcess.paperCertId,
        cachedQuantityAvailable: -orderProcess.quantity,
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
        change: -orderProcess.quantity,
        status: 'PENDING',
        assignPlan: {
          connect: {
            id: srcPlan.id,
          },
        },
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
  }

  // plan service로 이동시킬것(?)

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

    // assign이 없는 경우 에러
    if (!plan.assignStockEvent) throw new InternalServerErrorException();

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

    if (deletePlan) {
      // 플랜 삭제
      await tx.plan.update({
        where: {
          id: planId,
        },
        data: {
          isDeleted: true,
        },
      });
    } else {
      // assign만 해제
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

      const invoiceCode =
        dstCompany.managedById === null
          ? dstCompany.invoiceCode
          : await this.orderRetriveService.getNotUsingInvoiceCode();

      // 주문 생성
      const order = await tx.order.create({
        data: {
          orderNo: Util.serialT(invoiceCode),
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
          createdComapny: {
            connect: {
              id: params.isOffer ? params.dstCompanyId : params.srcCompanyId,
            },
          },
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
      const orderForUpdate = await tx.$queryRaw`
        SELECT *
          FROM \`Order\`
         WHERE id = ${params.orderId}

         FOR UPDATE;
      `;

      const orderCheck = await tx.order.findUnique({
        include: {
          dstCompany: true,
          srcCompany: true,
          orderStock: true,
        },
        where: {
          id: params.orderId,
        },
      });
      if (
        !orderCheck ||
        (orderCheck.dstCompanyId !== params.companyId &&
          orderCheck.srcCompanyId !== params.companyId)
      ) {
        throw new NotFoundException(`존재하지 않는 주문입니다.`);
      }
      if (orderCheck.orderType !== 'NORMAL')
        throw new ConflictException(`주문타입이 맞지 않습니다.`);

      this.validateUpdateOrder({
        companyId: params.companyId,
        orderStatus: orderCheck.status,
        srcCompany: orderCheck.srcCompany,
        dstCompany: orderCheck.dstCompany,
        curWantedDate1: orderCheck.orderStock.wantedDate.toISOString(),
        wantedDate1: params.wantedDate,
        curWantedDate2: null,
        wantedDate2: null,
        curLocationId1: orderCheck.orderStock.dstLocationId,
        locationId1: params.locationId,
        curLocationId2: null,
        locationId2: null,
        curIsDirectShipping1: orderCheck.orderStock.isDirectShipping,
        isDirectShipping1: params.isDirectShipping,
        curIsDirectShipping2: null,
        isDirectShipping2: null,
        curMemo: orderCheck.memo,
        memo: params.memo,
      });

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
          dstCompany: true,
        },
      });
      if (!order) throw new NotFoundException(`존재하지 않는 주문입니다.`);
      if (order.orderType !== 'NORMAL')
        throw new ConflictException(`거래타입이 맞지 않습니다.`);
      if (!Util.inc(order.status, 'OFFER_PREPARING', 'ORDER_PREPARING')) {
        throw new ConflictException(`원지를 수정가능한 주문상태가 아닙니다.`);
      }

      // 재고 체크 (판매자가 사용중인 경우)
      if (order.dstCompany.managedById === null) {
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
      }

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
          srcCompany: true,
          dstCompany: true,
        },
      });

      const partnerCompany =
        companyId === order.srcCompanyId ? order.dstCompany : order.srcCompany;

      if (!Util.inc(order.status, 'OFFER_PREPARING', 'ORDER_PREPARING')) {
        throw new ConflictException(
          '주문 요청을 보낼 수 있는 주문상태가 아닙니다.',
        );
      }
      if (partnerCompany.managedById !== null)
        throw new ConflictException(
          `미사용 거래처 대상 거래는 주문요청을 할 수 없습니다.`,
        );

      switch (order.orderType) {
        case OrderType.NORMAL:
          if (order.orderStock.quantity <= 0) {
            throw new BadRequestException(
              companyId === order.dstCompanyId
                ? `원지 사용 수량이 입력되지 않았습니다.`
                : `원지 주문 수량이 입력되지 않았습니다.`,
            );
          }
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
        case OrderType.OUTSOURCE_PROCESS:
          if (order.status === 'ORDER_PREPARING') {
            // 구매자가 요청 보낼시 재고 가용수량 차감(srcPlan 생성)
            await this.assignStockToProcessOrder(tx, companyId, orderId);
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
        throw new ConflictException('주문을 취소할 수 없는 상태입니다.');
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

  async accept(params: { userId: number; companyId: number; orderId: number }) {
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
          orderStock: true,
          orderDeposit: true,
          orderProcess: true,
        },
      });

      if (
        !Util.inc(
          order.status,
          'ORDER_PREPARING',
          'ORDER_REQUESTED',
          'OFFER_PREPARING',
          'OFFER_REQUESTED',
        )
      ) {
        throw new ConflictException(`승인 가능한 주문상태가 아닙니다.`);
      }

      const isDstCompany = order.dstCompany.id === params.companyId;
      const partnerCompany = isDstCompany ? order.srcCompany : order.dstCompany;

      // 거래처가 사용중인 경우 승인권한 체크
      if (partnerCompany.managedById === null) {
        if (
          // 구매자가 자체 승인 (X)
          (order.status === 'ORDER_PREPARING' && !isDstCompany) ||
          // 판매자가 자체승인 + 외주공정 (X)
          (order.status === 'OFFER_PREPARING' &&
            isDstCompany &&
            order.orderType === 'OUTSOURCE_PROCESS') ||
          // 요청후 자체승인 (X)
          (order.status === 'ORDER_REQUESTED' && !isDstCompany) ||
          (order.status === 'OFFER_REQUESTED' && isDstCompany)
        ) {
          throw new ForbiddenException(
            `주문승인 권한이 없습니다. 거래처에 문의해주세요.`,
          );
        }

        if (
          // 작성중인 주문을 거래처가 승인하려는 경우 (X)
          (order.status === 'ORDER_PREPARING' && isDstCompany) ||
          (order.status === 'OFFER_PREPARING' && !isDstCompany)
        ) {
          throw new ForbiddenException(`승인가능한 주문 상태가 아닙니다.`);
        }
      }

      switch (order.orderType) {
        case OrderType.NORMAL:
          if (order.orderStock.quantity <= 0) {
            throw new BadRequestException(
              isDstCompany
                ? `원지 사용 수량이 입력되지 않았습니다.`
                : `원지 주문 수량이 입력되지 않았습니다.`,
            );
          }
          // 구매자가 요청한 주문 승인시 OR 미사용거래처 대상 판매자 승인시 가용수량 차감 (dstPlan 생성)
          if (
            order.status === 'ORDER_REQUESTED' ||
            order.status === 'ORDER_PREPARING' ||
            order.status === 'OFFER_PREPARING'
          ) {
            await this.assignStockToNormalOrder(
              tx,
              order.dstCompany.id,
              orderId,
            );
          }
          // srcPlan도 생성 (도착예정재고 추가용)
          const plan = await this.planChangeService.createOrderStockSrcPlanTx(
            tx,
            order.srcCompany.id,
            order.orderStock.id,
          );
          // 구매자가 사용기업일때 srcPlan에 도착예정재고 자동 추가
          if (order.srcCompany.managedById === null) {
            const stock = await tx.stock.create({
              data: {
                serial: Util.serialP(order.srcCompany.invoiceCode),
                companyId: order.srcCompany.id,
                planId: plan.id,
                productId: order.orderStock.productId,
                packagingId: order.orderStock.packagingId,
                grammage: order.orderStock.grammage,
                sizeX: order.orderStock.sizeX,
                sizeY: order.orderStock.sizeY,
                paperColorGroupId: order.orderStock.paperColorGroupId,
                paperColorId: order.orderStock.paperColorId,
                paperPatternId: order.orderStock.paperPatternId,
                paperCertId: order.orderStock.paperCertId,
                initialPlanId: plan.id,
                cachedQuantityAvailable: order.orderStock.quantity,
                stockEvent: {
                  create: {
                    change: order.orderStock.quantity,
                    status: 'PENDING',
                    plan: {
                      connect: {
                        id: plan.id,
                      },
                    },
                  },
                },
              },
            });
            await this.stockChangeService.createDefaultStockPriceTx(
              tx,
              stock.id,
            );
          }
          break;
        case OrderType.DEPOSIT:
          await this.createDeposit(
            tx,
            params.userId,
            order.srcCompany,
            order.dstCompany,
            order.orderDeposit,
          );
          break;
        case OrderType.OUTSOURCE_PROCESS:
          if (params.companyId === order.dstCompany.id) {
            // 판매자가 승인시 (판매)
            if (order.srcCompany.managedById === null) {
              // 구매자가 사용 거래처 (dstPlan생성)
              await this.planChangeService.createOrderProcessDstPlanTx(
                tx,
                order.dstCompany.id,
                order.orderProcess.id,
              );
            } else {
              // 구매자가 미사용 거래처 (srcPlan, dstPlan생성) // 요청없이 바로 승인하는 경우이므로
              await this.assignStockToProcessOrder(
                tx,
                order.srcCompany.id,
                orderId,
              );
              await this.planChangeService.createOrderProcessDstPlanTx(
                tx,
                order.dstCompany.id,
                order.orderProcess.id,
              );
            }
          } else if (
            params.companyId === order.srcCompany.id &&
            order.dstCompany.managedById !== null
          ) {
            // 구매자가 직접 승인시(판매자가 미사용) (srcPlan, dstPlan 생성) // 요청없이 바로 승인하는 경우이므로
            await this.assignStockToProcessOrder(
              tx,
              order.srcCompany.id,
              orderId,
            );
            await this.planChangeService.createOrderProcessDstPlanTx(
              tx,
              order.dstCompany.id,
              order.orderProcess.id,
            );
          } else {
            throw new ForbiddenException(
              `주문승인 권한이 없습니다. 거래처에 문의해주세요.`,
            );
          }
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
          acceptedCompany: {
            connect: {
              id: params.companyId,
            },
          },
        },
      });
    });
  }

  private async createDeposit(
    tx: PrismaTransaction,
    userId: number,
    srcCompany: Company,
    dstCompany: Company,
    orderDeposit: OrderDeposit,
  ) {
    const orderDepositEntity = await tx.orderDeposit.findUnique({
      include: {
        order: {
          select: {
            createdComapny: true,
          },
        },
      },
      where: {
        id: orderDeposit.id,
      },
    });

    const deposit =
      (await tx.deposit.findFirst({
        where: {
          srcCompanyRegistrationNumber: srcCompany.companyRegistrationNumber,
          dstCompanyRegistrationNumber: dstCompany.companyRegistrationNumber,
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
          srcCompanyRegistrationNumber: srcCompany.companyRegistrationNumber,
          dstCompanyRegistrationNumber: dstCompany.companyRegistrationNumber,
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
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
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
            memo: '',
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

    // 재고금액
    await this.stockChangeService.createDefaultStockPriceTx(tx, targetStock.id);

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
              plan: {
                where: {
                  isDeleted: false,
                },
              },
            },
          },
          orderProcess: {
            include: {
              plan: {
                where: {
                  isDeleted: false,
                },
              },
            },
          },
        },
      });

      if (!Util.inc(order.status, 'OFFER_REQUESTED', 'ORDER_REQUESTED')) {
        throw new ConflictException('주문을 거절할 수 없는 상태입니다.');
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
        case OrderType.OUTSOURCE_PROCESS:
          // 구매자 plan 삭제
          const srcPlan = order.orderProcess.plan.find(
            (plan) => plan.type === 'TRADE_OUTSOURCE_PROCESS_BUYER',
          );
          await this.cancelAssignStockTx(tx, srcPlan.id, true);
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
              plan: {
                where: {
                  isDeleted: false,
                },
              },
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
        throw new ConflictException('주문을 취소할 수 없는 상태입니다.');
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
    stockPrice: StockCreateStockPriceRequest | null;
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
      stockPrice: StockCreateStockPriceRequest | null;
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
      stockPrice: StockCreateStockPriceRequest | null;
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
      stockPrice: StockCreateStockPriceRequest | null;
    },
  ) {
    // 구매처 작업계획의 동일한 스펙 체크
    const curStocks = await tx.stock.findMany({
      select: {
        stockEvent: {
          where: {
            status: {
              not: 'CANCELLED',
            },
          },
        },
      },
      where: {
        initialPlan: {
          id: plan.id,
        },
        stockEvent: {
          some: {
            status: {
              not: 'CANCELLED',
            },
          },
        },
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
    });
    if (curStocks.length > 0)
      throw new BadRequestException(`이미 추가된 재고 스펙입니다.`);

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
        isSyncPrice: false,
      },
      select: {
        id: true,
      },
    });

    if (stockSpec.stockPrice) {
      await tx.stockPrice.create({
        data: {
          stockId: stock.id,
          ...stockSpec.stockPrice,
        },
      });
    } else {
      await this.stockChangeService.createDefaultStockPriceTx(tx, stock.id);
    }

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
            params.suppliedPrice,
            params.vatPrice,
            params.isSyncPrice,
            params.orderStockTradePrice,
          );
          break;
        case 'DEPOSIT':
          await this.updateOrderDepositTradePriceTx(
            tx,
            orderId,
            companyId,
            params.suppliedPrice,
            params.vatPrice,
            params.orderDepositTradePrice,
          );
          break;
        default:
          await this.updateTradePriceTx(
            tx,
            orderId,
            companyId,
            params.suppliedPrice,
            params.vatPrice,
          );
          break;
      }
    });
  }

  async updateOrderStockTradePriceTx(
    tx: PrismaTransaction,
    orderId: number,
    companyId: number,
    suppliedPrice: number,
    vatPrice: number,
    isSyncPrice: boolean,
    orderStockTradePrice: OrderStockTradePrice,
  ) {
    if (isSyncPrice && orderStockTradePrice.orderStockTradeAltBundle) {
      throw new BadRequestException(
        `대체단가 적용시, 매입금액 덮어쓰기가 불가능합니다.`,
      );
    }

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

    const assignedStock = order.orderStock.plan.find(
      (plan) => plan.companyId === order.dstCompanyId,
    ).assignStockEvent.stock;

    if (orderStockTradePrice.orderStockTradeAltBundle) {
      this.tradePriceValidator.validateOrderStockTradePrice(
        orderStockTradePrice.orderStockTradeAltBundle.altSizeY
          ? 'SKID'
          : 'ROLL',
        orderStockTradePrice,
      );
    } else {
      this.tradePriceValidator.validateOrderStockTradePrice(
        // 판매자가 배정한 재고(원지) 기준으로 validation
        assignedStock.packaging.type,
        orderStockTradePrice,
      );
    }

    const tradePrice =
      order.tradePrice.find(
        (tp) => tp.orderStockTradePrice.companyId === companyId,
      ) || null;

    const srcPlan = order.orderStock.plan.find(
      (p) => p.type === 'TRADE_NORMAL_BUYER',
    );

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
        suppliedPrice,
        vatPrice,
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

    // 금액 덮어쓰기시, 같은 스펙 재고를 찾아서 금액 업데이트
    if (isSyncPrice && srcPlan.companyId === companyId) {
      const stocks = (
        await tx.stock.findMany({
          select: {
            id: true,
            stockPrice: true,
          },
          where: {
            initialPlanId: srcPlan.id,
            packagingId: assignedStock.packagingId,
            productId: assignedStock.productId,
            grammage: assignedStock.grammage,
            sizeX: assignedStock.sizeX,
            sizeY: assignedStock.sizeY,
            paperColorGroupId: assignedStock.paperColorGroupId,
            paperColorId: assignedStock.paperColorId,
            paperPatternId: assignedStock.paperPatternId,
            paperCertId: assignedStock.paperCertId,
          },
        })
      ).filter((stock) => stock.stockPrice !== null);

      if (stocks.length > 0) {
        await tx.stockPrice.updateMany({
          data: {
            officialPriceType: orderStockTradePrice.officialPriceType,
            officialPrice: orderStockTradePrice.officialPrice,
            officialPriceUnit: orderStockTradePrice.officialPriceUnit,
            discountType: orderStockTradePrice.discountType,
            discountPrice: orderStockTradePrice.discountPrice,
            unitPrice: orderStockTradePrice.unitPrice,
            unitPriceUnit: orderStockTradePrice.unitPriceUnit,
          },
          where: {
            stockId: {
              in: stocks.map((stock) => stock.id),
            },
          },
        });
      }
    }
  }

  async updateOrderDepositTradePriceTx(
    tx: PrismaTransaction,
    orderId: number,
    companyId: number,
    suppliedPrice: number,
    vatPrice: number,
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
        suppliedPrice,
        vatPrice,
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

  async updateTradePriceTx(
    tx: PrismaTransaction,
    orderId: number,
    companyId: number,
    suppliedPrice: number,
    vatPrice: number,
  ) {
    const order = await tx.order.findUnique({
      include: {
        tradePrice: true,
      },
      where: {
        id: orderId,
      },
    });

    const tradePrice = order.tradePrice.find(
      (tp) => tp.companyId === companyId,
    );

    await tx.tradePrice.upsert({
      where: {
        orderId_companyId: {
          orderId,
          companyId,
        },
      },
      update: {
        suppliedPrice,
        vatPrice,
      },
      create: {
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
        suppliedPrice,
        vatPrice,
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
  ): Promise<Model.Order> {
    return await this.prisma.$transaction(async (tx) => {
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

      const dstCompany = await tx.company.findUnique({
        where: {
          id: dstCompanyId,
        },
      });

      const invoiceCode =
        dstCompany.managedById === null
          ? dstCompany.invoiceCode
          : await this.orderRetriveService.getNotUsingInvoiceCode();

      // 보관등록 주문 생성
      const order = await tx.order.create({
        select: {
          id: true,
        },
        data: {
          orderNo: Util.serialT(invoiceCode),
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
          createdComapny: {
            connect: {
              id: isOffer ? dstCompanyId : srcCompanyId,
            },
          },
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

      return this.getOrderCreateResponseTx(tx, order.id);
    });
  }

  async createOrderDeposit(
    userId: number,
    companyId: number,
    orderId: number,
    depositId: number,
    quantity: number,
  ) {
    const company = await this.prisma.company.findUnique({
      where: {
        id: companyId,
      },
    });
    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        include: {
          srcCompany: true,
          dstCompany: true,
          createdComapny: true,
          depositEvent: {
            include: {
              deposit: true,
            },
          },
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

      if (order.depositEvent)
        throw new ConflictException(`보관품이 이미 등록되어 있습니다.`);

      const deposit = await tx.deposit.findUnique({
        where: {
          id: depositId,
        },
      });
      if (
        !deposit ||
        deposit.srcCompanyRegistrationNumber !==
          order.srcCompany.companyRegistrationNumber ||
        deposit.dstCompanyRegistrationNumber !==
          order.dstCompany.companyRegistrationNumber
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
          user: {
            connect: {
              id: userId,
            },
          },
          change: -quantity,
          targetOrder: {
            connect: {
              id: orderId,
            },
          },
        },
      });
    });
  }

  async updateOrderDepositAssign(params: {
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
  }) {
    await this.prisma.$transaction(async (tx) => {
      const order = await this.getOrderCreateResponseTx(tx, params.orderId);
      if (
        !order ||
        (order.srcCompany.id !== params.companyId &&
          order.dstCompany.id !== params.companyId)
      ) {
        throw new NotFoundException(`존재하지 않는 주문입니다.`);
      }
      if (order.orderType !== 'DEPOSIT') {
        throw new ConflictException(`주문타입이 맞지 않습니다.`);
      }
      if (!Util.inc(order.status, 'OFFER_PREPARING', 'ORDER_PREPARING')) {
        throw new ConflictException(`원지를 수정할 수 없는 주문상태 입니다.`);
      }

      // 매입작성중에 판매자가 원지수정하려고 하는경우 OR
      // 매출작성중에 구매자가 원지 수정하려고 하는 경우
      if (
        (order.status === 'OFFER_PREPARING' &&
          order.srcCompany.id === params.companyId) ||
        (order.status === 'ORDER_PREPARING' &&
          order.dstCompany.id === params.companyId)
      ) {
        throw new NotFoundException(`존재하지 않는 주문입니다.`);
      }

      await tx.orderDeposit.update({
        where: {
          id: order.orderDeposit.id,
        },
        data: {
          packaging: {
            connect: {
              id: params.packagingId,
            },
          },
          product: {
            connect: {
              id: params.productId,
            },
          },
          grammage: params.grammage,
          sizeX: params.sizeX,
          sizeY: params.sizeY,
          paperColorGroup: params.paperColorGroupId
            ? {
                connect: {
                  id: params.paperColorGroupId,
                },
              }
            : undefined,
          paperColor: params.paperColorId
            ? {
                connect: {
                  id: params.paperColorId,
                },
              }
            : undefined,
          paperPattern: params.paperPatternId
            ? {
                connect: {
                  id: params.paperPatternId,
                },
              }
            : undefined,
          paperCert: params.paperCertId
            ? {
                connect: {
                  id: params.paperCertId,
                },
              }
            : undefined,
          quantity: params.quantity,
        },
      });
    });
  }

  async updateOrderDeposit(
    userId: number,
    companyId: number,
    orderId: number,
    depositId: number,
    quantity: number,
  ) {
    const company = await this.prisma.company.findUnique({
      where: {
        id: companyId,
      },
    });
    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        include: {
          srcCompany: true,
          dstCompany: true,
          createdComapny: true,
          depositEvent: true,
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

      const deposit = await tx.deposit.findUnique({
        where: {
          id: depositId,
        },
      });
      if (
        !deposit ||
        deposit.srcCompanyRegistrationNumber !==
          order.srcCompany.companyRegistrationNumber ||
        deposit.dstCompanyRegistrationNumber !==
          order.dstCompany.companyRegistrationNumber
      ) {
        throw new NotFoundException(`존재하지 않는 보관입니다.`);
      }

      const depositEvent = order.depositEvent;
      if (depositEvent) {
        await tx.depositEvent.update({
          data: {
            status: DepositEventStatus.CANCELLED,
            targetOrder: {
              disconnect: true,
            },
          },
          where: {
            id: depositEvent.id,
          },
        });
      }
      await tx.depositEvent.create({
        data: {
          deposit: {
            connect: {
              id: depositId,
            },
          },
          user: {
            connect: {
              id: userId,
            },
          },
          change: -quantity,
          targetOrder: {
            connect: {
              id: orderId,
            },
          },
        },
      });

      await this.updateOrderRevisionTx(tx, orderId);
    });
  }

  async deleteOrderDeposit(companyId: number, orderId: number) {
    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        include: {
          srcCompany: true,
          dstCompany: true,
          depositEvent: true,
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
      if (!order.depositEvent)
        throw new ConflictException(`보관이 등록되어 있지 않습니다.`);

      await tx.depositEvent.update({
        data: {
          status: DepositEventStatus.CANCELLED,
          targetOrder: {
            disconnect: true,
          },
        },
        where: {
          id: order.depositEvent.id,
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
      const srcCompany = await tx.company.findUnique({
        where: {
          id: srcCompanyId,
        },
      });
      if (companyId !== srcCompanyId) {
        if (!srcCompany)
          throw new BadRequestException(`존재하지 않는 거래처입니다.`);
        if (srcCompany.managedById === null)
          throw new BadRequestException(
            `페이퍼웨어 사용중인 기업에는 외주공정매출을 등록할 수 없습니다.`,
          );
      }

      // TODO: 거래처 확인
      // TODO: 도착지 확인

      // 재고 가용수량 확인 (구매자가 사용중인 경우에만)
      if (srcCompany.managedById === null) {
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
      }

      const dstCompany = await tx.company.findUnique({
        where: {
          id: dstCompanyId,
        },
      });

      const invoiceCode =
        dstCompany.managedById === null
          ? dstCompany.invoiceCode
          : await this.orderRetriveService.getNotUsingInvoiceCode();

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
          orderNo: Util.serialT(invoiceCode),
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
          createdComapny: {
            connect: {
              id: companyId,
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
              warehouse: warehouseId
                ? {
                    connect: {
                      id: warehouseId,
                    },
                  }
                : undefined,
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
          id: orderId,
        },
      });
      if (
        !order ||
        (order.srcCompanyId !== companyId && order.dstCompanyId !== companyId)
      )
        throw new NotFoundException(`존재하지 않는 주문입니다.`);
      if (order.orderType !== 'OUTSOURCE_PROCESS')
        throw new ConflictException(
          `잘못된 요청입니다. 주문타입을 확인해주세요`,
        );
      if (
        companyId !== order.srcCompanyId &&
        order.srcCompany.managedById === null
      )
        throw new BadRequestException(`원지정보 변경은 구매기업만 가능합니다.`);

      // 구매자가 사용중 기업이면 가용수량 체크
      if (order.srcCompany.managedById === null) {
        await this.stockQuantityChecker.checkStockGroupAvailableQuantityTx(tx, {
          inquiryCompanyId: companyId,
          companyId: order.srcCompany.id,
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
      }

      switch (order.status) {
        case 'OFFER_PREPARING':
        case 'ORDER_PREPARING':
          break;
        default:
          throw new ConflictException(
            `원지 정보를 수정 불가능한 주문상태 입니다.`,
          );
      }

      await tx.orderProcess.update({
        where: {
          id: order.orderProcess.id,
        },
        data: {
          companyId: order.srcCompanyId,
          warehouseId: warehouseId,
          planId: planId,
          productId: productId,
          packagingId: packagingId,
          grammage: grammage,
          sizeX: sizeX,
          sizeY: sizeY,
          paperColorGroupId: paperColorGroupId,
          paperColorId: paperColorId,
          paperPatternId: paperPatternId,
          paperCertId: paperCertId,
          quantity: quantity,
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

      const dstCompany = await tx.company.findUnique({
        where: {
          id: dstCompanyId,
        },
      });

      const invoiceCode =
        dstCompany.managedById === null
          ? dstCompany.invoiceCode
          : await this.orderRetriveService.getNotUsingInvoiceCode();

      const order = await tx.order.create({
        include: {
          srcCompany: true,
          dstCompany: true,
          orderEtc: true,
        },
        data: {
          orderType: 'ETC',
          orderNo: Util.serialT(invoiceCode),
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
          createdComapny: {
            connect: {
              id: companyId,
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
