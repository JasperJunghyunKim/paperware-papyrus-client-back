import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  InvoiceStatus,
  OrderStatus,
  OrderType,
  Prisma,
  TaskStatus,
  TaskType,
} from '@prisma/client';
import { Sql } from '@prisma/client/runtime';
import _ from 'lodash';
import { Model } from 'src/@shared';
import { Selector, Util } from 'src/common';
import {
  COMPANY,
  DEPOSIT,
  LOCATION,
  ORDER_DEPOSIT,
  ORDER_PROCESS,
  PACKAGING,
  PAPER_CERT,
  PAPER_COLOR,
  PAPER_COLOR_GROUP,
  PAPER_PATTERN,
  PRODUCT,
  STOCK_EVENT,
  WAREHOUSE,
} from 'src/common/selector';
import { PrismaService } from 'src/core';
import { StockRetriveService } from 'src/modules/stock/service/stock-retrive.service';

export type SearchOrderType =
  | 'NORMAL'
  | 'DEPOSIT'
  | 'NORMAL_DEPOSIT'
  | 'PROCESS'
  | 'ETC';

export type SearchBookCloseMethod = 'TAX_INVOICE';

@Injectable()
export class OrderRetriveService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stockRetriveService: StockRetriveService,
  ) {}

  async getList(params: {
    companyId: number;
    skip?: number;
    take?: number;
    srcCompanyId?: number;
    dstCompanyId?: number;
    srcCompanyRegistrationNumber: string | null;
    bookClosed: boolean | null;
    year: string | null;
    month: string | null;
    status: OrderStatus[];
    /// 검색
    orderTypes: SearchOrderType[];
    partnerCompanyRegistrationNumbers: string[];
    orderNo: string | null;
    minOrderDate: string | null;
    maxOrderDate: string | null;
    minWantedDate: string | null;
    maxWantedDate: string | null;
    orderStatus: OrderStatus[];
    taskStatus: TaskStatus[];
    releaseStatus: TaskStatus[];
    invoiceStatus: InvoiceStatus[];
    packagingIds: number[];
    paperTypeIds: number[];
    manufacturerIds: number[];
    minGrammage: number | null;
    maxGrammage: number | null;
    sizeX: number | null;
    sizeY: number | null;
    bookCloseMethods: SearchBookCloseMethod[];
  }): Promise<{
    items: Model.Order[];
    total: number;
  }> {
    const { companyId, srcCompanyId, dstCompanyId } = params;
    const isOffer = companyId === dstCompanyId;

    const companyIdQuery = isOffer
      ? Prisma.sql`o.dstCompanyId = ${companyId}`
      : Prisma.sql`o.srcCompanyId = ${companyId}`;

    /// 1. 거래유형
    params.orderTypes = Array.from(new Set(params.orderTypes));
    let normalTypeQuery: Sql | null = null;
    let depositTypeQuery: Sql | null = null;
    let normalDepositTypeQuery: Sql | null = null;
    let processTypeQuery: Sql | null = null;
    let etcTypeQuery: Sql | null = null;
    for (const orderType of params.orderTypes) {
      switch (orderType) {
        case 'NORMAL':
          normalTypeQuery = Prisma.sql` (o.orderType = ${OrderType.NORMAL} AND o.depositEventId IS NULL) OR`;
          break;
        case 'DEPOSIT':
          depositTypeQuery = Prisma.sql` (o.orderType = ${OrderType.DEPOSIT}) OR`;
          break;
        case 'NORMAL_DEPOSIT':
          normalDepositTypeQuery = Prisma.sql` (o.orderType = ${OrderType.NORMAL} AND o.depositEventId IS NOT NULL) OR`;
          break;
        case 'PROCESS':
          processTypeQuery = Prisma.sql` (o.orderType = ${OrderType.OUTSOURCE_PROCESS}) OR`;
          break;
        case 'ETC':
          etcTypeQuery = Prisma.sql` (o.orderType = ${OrderType.ETC}) OR`;
          break;
      }
    }

    const orderTypeQuery =
      params.orderTypes.length > 0
        ? Prisma.sql`
          AND (
            ${normalTypeQuery ? normalTypeQuery : Prisma.empty}
            ${depositTypeQuery ? depositTypeQuery : Prisma.empty}
            ${normalDepositTypeQuery ? normalDepositTypeQuery : Prisma.empty}
            ${processTypeQuery ? processTypeQuery : Prisma.empty}
            ${etcTypeQuery ? etcTypeQuery : Prisma.empty}
            (0=1)
          )
        `
        : Prisma.empty;

    /// 2. 거래처
    let partnerQuery = Prisma.empty;
    if (params.partnerCompanyRegistrationNumbers.length > 0) {
      partnerQuery = isOffer
        ? Prisma.sql`AND srcCompany.companyRegistrationNumber IN (${Prisma.join(
            params.partnerCompanyRegistrationNumbers,
          )})`
        : Prisma.sql`AND dstCompany.companyRegistrationNumber IN (${Prisma.join(
            params.partnerCompanyRegistrationNumbers,
          )})`;
    }

    /// 3. 매출번호
    const orderNoQuery = params.orderNo
      ? Prisma.sql`AND o.orderNo = ${params.orderNo}`
      : Prisma.empty;

    /// 4. 거래일
    const minOrderDateQuery = params.minOrderDate
      ? Prisma.sql`AND SUBSTR(CONVERT_TZ(o.orderDate, '+00:00', '+09:00'), 1, 10) >= CONVERT_TZ(${params.minOrderDate}, '+00:00', '+09:00')`
      : Prisma.empty;
    const maxOrderDateQuery = params.maxOrderDate
      ? Prisma.sql`AND SUBSTR(CONVERT_TZ(o.orderDate, '+00:00', '+09:00'), 1, 10) <= CONVERT_TZ(${params.maxOrderDate}, '+00:00', '+09:00')`
      : Prisma.empty;

    /// 5. 납품요청일
    const minWantedDateQuery = params.minWantedDate
      ? Prisma.sql`AND (CASE
        WHEN o.orderType = ${OrderType.NORMAL} THEN SUBSTR(CONVERT_TZ(os.wantedDate, '+00:00', '+09:00'), 1, 10) >= CONVERT_TZ(${params.minWantedDate}, '+00:00', '+09:00')
        WHEN o.orderType = ${OrderType.OUTSOURCE_PROCESS} THEN SUBSTR(CONVERT_TZ(op.srcWantedDate, '+00:00', '+09:00'), 1, 10) >= CONVERT_TZ(${params.minWantedDate}, '+00:00', '+09:00')
        ELSE 0=1
      END)`
      : Prisma.empty;
    const maxWantedDateQuery = params.maxWantedDate
      ? Prisma.sql`AND (CASE
        WHEN o.orderType = ${OrderType.NORMAL} THEN SUBSTR(CONVERT_TZ(os.wantedDate, '+00:00', '+09:00'), 1, 10) <= CONVERT_TZ(${params.maxWantedDate}, '+00:00', '+09:00')
        WHEN o.orderType = ${OrderType.OUTSOURCE_PROCESS} THEN SUBSTR(CONVERT_TZ(op.srcWantedDate, '+00:00', '+09:00'), 1, 10) <= CONVERT_TZ(${params.maxWantedDate}, '+00:00', '+09:00')
        ELSE 0=1
      END)`
      : Prisma.empty;

    /// 6. 주문상태
    const orderStatusMap = new Map<string, boolean>();
    for (const status of params.status) {
      orderStatusMap.set(status, true);
    }
    const orderStautsQuery =
      params.orderStatus.length > 0
        ? Prisma.sql`AND o.status IN (${Prisma.join(
            params.orderStatus.filter((s) => orderStatusMap.get(s)),
          )})`
        : Prisma.sql`AND o.status IN (${Prisma.join(params.status)})`;

    /// 7. 공정 상태
    params.taskStatus = Array.from(new Set(params.taskStatus)).filter((s) =>
      Util.inc(s, 'PREPARING', 'PROGRESSING', 'PROGRESSED'),
    );
    const taskStatusQuery =
      params.taskStatus.length > 0
        ? Prisma.sql`JOIN (
        SELECT *
          FROM (
            SELECT *, ROW_NUMBER() OVER(PARTITION BY planId) AS rowNum
              FROM Task
            WHERE status IN (${Prisma.join(params.taskStatus)})
              AND type != ${TaskType.RELEASE}
          ) AS A
        WHERE A.rowNum = 1
      ) AS taskCheck ON taskCheck.planId = dstPlan.id`
        : Prisma.empty;

    /// 8. 출고 상태
    params.releaseStatus = Array.from(new Set(params.releaseStatus)).filter(
      (s) => Util.inc(s, 'PREPARING', 'PROGRESSED'),
    );
    const releaseStatusQuery =
      params.releaseStatus.length > 0
        ? Prisma.sql`JOIN (
        SELECT *
          FROM (
            SELECT *, ROW_NUMBER() OVER(PARTITION BY planId) AS rowNum
              FROM Task
            WHERE status IN (${Prisma.join(params.releaseStatus)})
              AND type = ${TaskType.RELEASE}
          ) AS B
        WHERE B.rowNum = 1
      ) AS \`releaseCheck\` ON \`releaseCheck\`.planId = dstPlan.id`
        : Prisma.empty;

    /// 9. 배송 상태
    params.invoiceStatus = Array.from(new Set(params.invoiceStatus)).filter(
      (s) => Util.inc(s, 'WAIT_SHIPPING', 'ON_SHIPPING', 'DONE_SHIPPING'),
    );
    const invoiceStatusQuery =
      params.invoiceStatus.length > 0
        ? Prisma.sql`JOIN (
        SELECT *
          FROM (
            SELECT *, ROW_NUMBER() OVER(PARTITION BY planId) AS rowNum
              FROM Invoice
            WHERE invoiceStatus IN (${Prisma.join(params.invoiceStatus)})
          ) AS C
        WHERE C.rowNum = 1
      ) AS invoiceCheck ON invoiceCheck.planId = dstPlan.id`
        : Prisma.empty;

    /// 10. 포장
    const packagingQuery =
      params.packagingIds.length > 0
        ? Prisma.sql`AND (CASE 
          WHEN o.orderType = ${
            OrderType.NORMAL
          } THEN os.packagingId IN (${Prisma.join(params.packagingIds)})
          WHEN o.orderType = ${
            OrderType.OUTSOURCE_PROCESS
          } THEN op.packagingId IN (${Prisma.join(params.packagingIds)})
          ELSE 0 = 1
        END)`
        : Prisma.empty;

    /// 11. 지종
    const paperTypeQuery =
      params.paperTypeIds.length > 0
        ? Prisma.sql`AND product.paperTypeId IN (${Prisma.join(
            params.paperTypeIds,
          )})`
        : Prisma.empty;

    /// 12. 제지사
    const manufacturerQuery =
      params.manufacturerIds.length > 0
        ? Prisma.sql`AND product.manufacturerId IN (${Prisma.join(
            params.manufacturerIds,
          )})`
        : Prisma.empty;

    /// 13. 평량
    const minGrammageQuery =
      params.minGrammage !== null
        ? Prisma.sql`AND (CASE
            WHEN o.orderType = ${OrderType.NORMAL} THEN os.grammage >= ${params.minGrammage}
            WHEN o.orderType = ${OrderType.OUTSOURCE_PROCESS} THEN op.grammage >= ${params.minGrammage}
            ELSE 0=1
          END)`
        : Prisma.empty;
    const maxrammageQuery =
      params.maxGrammage !== null
        ? Prisma.sql`AND (CASE
            WHEN o.orderType = ${OrderType.NORMAL} THEN os.grammage <= ${params.maxGrammage}
            WHEN o.orderType = ${OrderType.OUTSOURCE_PROCESS} THEN op.grammage <= ${params.maxGrammage}
            ELSE 0=1
          END)`
        : Prisma.empty;

    /// 14. 지폭
    const sizeXQuery =
      params.sizeX !== null
        ? Prisma.sql`AND (CASE
            WHEN o.orderType = ${OrderType.NORMAL} THEN os.sizeX >= ${params.sizeX}
            WHEN o.orderType = ${OrderType.OUTSOURCE_PROCESS} THEN op.sizeX >= ${params.sizeX}
            ELSE 0=1
          END)`
        : Prisma.empty;

    /// 15. 지장
    const sizeYQuery =
      params.sizeY !== null
        ? Prisma.sql`AND (CASE
            WHEN o.orderType = ${OrderType.NORMAL} THEN os.sizeY >= ${params.sizeY}
            WHEN o.orderType = ${OrderType.OUTSOURCE_PROCESS} THEN op.sizeY >= ${params.sizeY}
            ELSE 0=1
          END)`
        : Prisma.empty;

    /// 16. 마감
    params.bookCloseMethods = Array.from(
      new Set(params.bookCloseMethods),
    ).filter((m) => Util.inc(m, 'TAX_INVOICE'));
    const bookCloseMethodMap = new Map<string, boolean>();
    for (const bcMethod of params.bookCloseMethods) {
      bookCloseMethodMap.set(bcMethod, true);
    }
    const bookCloseMethodQuery =
      params.bookCloseMethods.length > 0
        ? Prisma.sql`AND (
            ${
              bookCloseMethodMap.get('TAX_INVOICE')
                ? Prisma.sql`(o.taxInvoiceId IS NOT NULL) OR`
                : Prisma.empty
            }
          (0=1)
        )`
        : Prisma.empty;

    /// 세금계산서 - 매출목록
    const yearAndMonthQuery =
      params.year && params.month
        ? Prisma.sql`AND SUBSTR(CONVERT_TZ(o.orderDate, '+00:00', '+09:00'), 1, 7) = ${
            params.year + '-' + params.month.toString().padStart(2, '0')
          }`
        : Prisma.empty;
    const srcCompanyQuery = params.srcCompanyRegistrationNumber
      ? Prisma.sql`AND o.srcCmopanyRegistrationNumber = ${params.srcCompanyRegistrationNumber}`
      : Prisma.empty;
    const bookCloseQuery =
      params.bookClosed === null
        ? Prisma.empty
        : params.bookClosed
        ? Prisma.sql`AND o.taxInvoiceId IS NOT NULL`
        : Prisma.sql`AND o.taxInvoiceId IS NULL`;

    // 검색으로인한 수정
    const searchOrders: {
      id: number;
      total: bigint;
    }[] = await this.prisma.$queryRaw`
        SELECT o.id
              , o.orderNo
              , o.orderType
              , o.orderDate
              , o.status
              , os.wantedDate AS osWantedDate
              , op.srcWantedDate AS opWantedDate
              , dstPlan.id AS dstPlanId
              , product.id AS productId
              , COUNT(1) OVER() AS total
          FROM \`Order\`      AS o
          JOIN Company        AS srcCompany     ON srcCompany.id = o.srcCompanyId
          JOIN Company        AS dstCompany     ON dstCompany.id = o.dstCompanyId
     LEFT JOIN DepositEvent   AS ode            ON ode.id = o.depositEventId
     
          -- 거래종류/원지
     LEFT JOIN OrderStock     AS os             ON os.orderId = o.id
     LEFT JOIN OrderProcess   AS op             ON op.orderId = o.id
     LEFT JOIN Product        AS product        ON product.id = (CASE 
                                                                    WHEN o.orderType = ${
                                                                      OrderType.NORMAL
                                                                    } THEN os.productId
                                                                    WHEN o.orderType = ${
                                                                      OrderType.OUTSOURCE_PROCESS
                                                                    } THEN op.productId
                                                                    ELSE 0
                                                                END)

          -- 공정정보 (dstPlan)
     LEFT JOIN Plan           AS dstPlan        ON dstPlan.isDeleted = ${false} AND dstPlan.companyId = o.dstCompanyId AND (CASE 
                                                                                                                  WHEN o.orderType = ${
                                                                                                                    OrderType.NORMAL
                                                                                                                  } THEN dstPlan.orderStockId = os.id
                                                                                                                  WHEN o.orderType = ${
                                                                                                                    OrderType.OUTSOURCE_PROCESS
                                                                                                                  } THEN dstPlan.orderProcessId = op.id
                                                                                                                  ELSE 0=1
                                                                                                                END)
          ${taskStatusQuery}
          ${releaseStatusQuery}
          ${invoiceStatusQuery}

         WHERE ${companyIdQuery}
            ${orderTypeQuery}
            ${partnerQuery}
            ${orderNoQuery}
            ${minOrderDateQuery}
            ${maxOrderDateQuery}
            ${minWantedDateQuery}
            ${maxWantedDateQuery}
            ${orderStautsQuery}
            ${packagingQuery}
            ${paperTypeQuery}
            ${manufacturerQuery}
            ${minGrammageQuery}
            ${maxrammageQuery}
            ${sizeXQuery}
            ${sizeYQuery}
            ${bookCloseMethodQuery}
            ${srcCompanyQuery}
            ${bookCloseQuery}
            ${yearAndMonthQuery}

        ORDER BY o.id DESC

        LIMIT ${params.skip}, ${params.take}
      `;

    if (searchOrders.length === 0) {
      return {
        items: [],
        total: 0,
      };
    }

    const orders = await this.prisma.order.findMany({
      select: {
        ...Selector.ORDER,
        orderStock: {
          select: {
            ...Selector.ORDER.orderStock.select,
            plan: {
              select: {
                ...Selector.ORDER.orderStock.select.plan.select,
                invoice: { select: { invoiceStatus: true } },
                task: { select: { type: true, status: true } },
              },
            },
          },
        },
        orderProcess: {
          select: {
            ...Selector.ORDER.orderProcess.select,
            plan: {
              select: {
                ...Selector.ORDER.orderProcess.select.plan.select,
                invoice: { select: { invoiceStatus: true } },
                task: { select: { type: true, status: true } },
              },
            },
          },
        },
        orderDeposit: {
          select: ORDER_DEPOSIT,
        },
        depositEvent: {
          include: {
            deposit: {
              select: DEPOSIT,
            },
          },
        },
      },
      where: {
        id: {
          in: searchOrders.map((o) => o.id),
        },
      },
    });

    const planOrderIdMap = new Map<number, number>();
    const dstPlans: {
      orderId: number;
      planId: number;
    }[] = orders
      .filter((o) => Util.inc(o.orderType, 'NORMAL', 'OUTSOURCE_PROCESS'))
      .map((o) => {
        const plan =
          (o.orderStock
            ? o.orderStock.plan.find((p) => p.type === 'TRADE_NORMAL_SELLER')
            : o.orderProcess.plan.find(
                (p) => p.type === 'TRADE_OUTSOURCE_PROCESS_SELLER',
              )) || null;

        return plan
          ? {
              orderId: o.id,
              planId: plan.id,
            }
          : null;
      })
      .filter((p) => p !== null);
    for (const plan of dstPlans) {
      planOrderIdMap.set(plan.planId, plan.orderId);
    }

    const orderStockSuppliedPriceMap = new Map<number, number>();
    if (dstPlans.length > 0) {
      const plans = await this.prisma.plan.findMany({
        include: {
          targetStockEvent: {
            include: {
              stock: {
                include: {
                  packaging: true,
                  stockPrice: true,
                },
              },
            },
            where: {
              status: 'NORMAL',
              change: {
                lt: 0,
              },
            },
          },
        },
        where: {
          id: {
            in: dstPlans.map((p) => p.planId),
          },
        },
      });
      for (const plan of plans) {
        let supplicedPrice = 0;
        for (const stockEvent of plan.targetStockEvent) {
          supplicedPrice += this.stockRetriveService.getStockSuppliedPrice(
            stockEvent.stock,
            Math.abs(stockEvent.change),
            stockEvent.stock.stockPrice,
          );
        }

        orderStockSuppliedPriceMap.set(
          planOrderIdMap.get(plan.id),
          supplicedPrice,
        );
      }
    }

    return {
      items: orders.map((o) => {
        const supplicedPrice = orderStockSuppliedPriceMap.get(o.id);
        const salesTradePrice =
          o.tradePrice.find((tp) => tp.companyId === o.dstCompany.id)
            ?.suppliedPrice || 0;

        return {
          ...Util.serialize(o),
          purchaseSuppliedPrice:
            supplicedPrice === undefined ? null : supplicedPrice,
          salesSuppliedPrice:
            supplicedPrice === undefined ? null : salesTradePrice,
          salesProfit:
            supplicedPrice === undefined
              ? null
              : salesTradePrice - supplicedPrice,
          salesProfitRate:
            supplicedPrice === undefined
              ? null
              : ((salesTradePrice - supplicedPrice) / salesTradePrice) * 100,
        };
      }),
      total: Number(searchOrders[0].total),
    };
  }

  async getCount(params: {
    srcCompanyId?: number;
    dstCompanyId?: number;
    status: OrderStatus[];
    srcCompanyRegistrationNumber: string | null;
    bookClosed: boolean | null;
    year: string | null;
    month: string | null;
  }): Promise<number> {
    const { srcCompanyId, dstCompanyId } = params;

    const monthFirstDay =
      params.year && params.month
        ? new Date(
            `${params.year}-${
              params.month.length === 1 ? '0' + params.month : params.month
            }-01`,
          )
        : null;

    const count = await this.prisma.order.count({
      where: {
        OR: [
          {
            srcCompanyId,
          },
          {
            dstCompanyId,
          },
        ],
        status: {
          in: params.status,
        },
        // 세금계산서 매출 검색 조건
        srcCompany: params.srcCompanyRegistrationNumber
          ? {
              companyRegistrationNumber: params.srcCompanyRegistrationNumber,
            }
          : undefined,
        taxInvoiceId:
          params.bookClosed === null
            ? undefined
            : params.bookClosed
            ? {
                not: null,
              }
            : null,
        orderDate: monthFirstDay
          ? {
              gte: monthFirstDay,
              lt: Util.addMonth(monthFirstDay, 1),
            }
          : undefined,
      },
    });

    return count;
  }

  async getItem(params: { orderId: number }): Promise<Model.Order | null> {
    const { orderId } = params;

    const order = await this.prisma.order.findUnique({
      select: Selector.ORDER,
      where: {
        id: orderId,
      },
    });

    if (!order) {
      return null;
    }

    let dstPlan = null;
    switch (order.orderType) {
      case 'NORMAL':
        dstPlan =
          order.orderStock.plan.find((p) => p.type === 'TRADE_NORMAL_SELLER') ||
          null;
        break;
      case 'OUTSOURCE_PROCESS':
        dstPlan =
          order.orderProcess.plan.find(
            (p) => p.type === 'TRADE_OUTSOURCE_PROCESS_SELLER',
          ) || null;
        break;
    }

    let supplicedPrice = 0;
    if (dstPlan) {
      const plan = await this.prisma.plan.findUnique({
        include: {
          targetStockEvent: {
            include: {
              stock: {
                include: {
                  packaging: true,
                  stockPrice: true,
                },
              },
            },
            where: {
              status: 'NORMAL',
              change: {
                lt: 0,
              },
            },
          },
        },
        where: {
          id: dstPlan.id,
        },
      });

      for (const stockEvent of plan.targetStockEvent) {
        supplicedPrice += this.stockRetriveService.getStockSuppliedPrice(
          stockEvent.stock,
          Math.abs(stockEvent.change),
          stockEvent.stock.stockPrice,
        );
      }
    }

    const salesTradePrice =
      order.tradePrice.find((tp) => tp.companyId === order.dstCompany.id)
        ?.suppliedPrice || 0;

    return Util.serialize({
      ...order,
      purchaseSuppliedPrice: dstPlan ? supplicedPrice : null,
      salesSuppliedPrice: dstPlan ? salesTradePrice : null,
      salesProfit: dstPlan ? salesTradePrice - supplicedPrice : null,
      salesProfitRate: dstPlan
        ? ((salesTradePrice - supplicedPrice) / salesTradePrice) * 100
        : null,
    });
  }

  /** 원지 가져오기 */
  async getAssignStockEvent(params: {
    orderId: number;
  }): Promise<Model.StockEvent> {
    const order = await this.prisma.order.findUnique({
      where: { id: params.orderId },
    });

    const orderStock = await this.prisma.orderStock.findUnique({
      where: { orderId: params.orderId },
      select: { id: true },
    });

    // 원지 정보는 판매자(dstCompany) 작업 계획에 있음
    const dstPlan = await this.prisma.plan.findFirst({
      where: { orderStockId: orderStock.id, companyId: order.dstCompanyId },
      select: {
        assignStockEvent: {
          select: Selector.STOCK_EVENT,
        },
      },
    });

    return Util.serialize(dstPlan.assignStockEvent);
  }

  /** 도착 목록 가져오기 */
  async getArrivalStockList(params: {
    orderId: number;
    skip?: number;
    take?: number;
  }): Promise<Model.Stock[]> {
    const order = await this.prisma.order.findUnique({
      include: {
        orderStock: true,
        orderReturn: true,
      },
      where: { id: params.orderId },
    });

    // 도착 정보는 구매자(srcCompany) 작업 계획에 있음
    // 반품의 경우에는 판매자(dstCompany)
    const srcPlan = await this.prisma.plan.findFirst({
      where: {
        orderStockId:
          order.orderType === 'NORMAL' ? order.orderStock.id : undefined,
        orderReturnId:
          order.orderType === 'RETURN' ? order.orderReturn.id : undefined,
        companyId:
          order.orderType === 'RETURN'
            ? order.dstCompanyId
            : order.srcCompanyId,
      },
      select: {
        id: true,
      },
    });

    const list = await this.prisma.stock.findMany({
      where: {
        planId: srcPlan.id,
      },
      select: Selector.STOCK,
      skip: params.skip,
      take: params.take,
    });

    return list.map((item) => Util.serialize(item));
  }

  /** 도착 목록 수 가져오기 */
  async getArrivalStockCount(params: { orderId: number }): Promise<number> {
    const order = await this.prisma.order.findUnique({
      include: {
        orderStock: true,
        orderReturn: true,
      },
      where: { id: params.orderId },
    });

    console.log(111, order);

    // 도착 정보는 구매자(srcCompany) 작업 계획에 있음
    // 반품의 경우에는 판매자(dstCompany)
    const srcPlan = await this.prisma.plan.findFirst({
      where: {
        orderStockId:
          order.orderType === 'NORMAL' ? order.orderStock.id : undefined,
        orderReturnId:
          order.orderType === 'RETURN' ? order.orderReturn.id : undefined,
        companyId:
          order.orderType === 'RETURN'
            ? order.dstCompanyId
            : order.srcCompanyId,
      },
      select: {
        id: true,
      },
    });

    return await this.prisma.stock.count({
      where: { planId: srcPlan.id },
    });
  }

  /** 거래금액 조회 */
  async getTradePrice(companyId: number, orderId: number) {
    const order = await this.prisma.order.findFirst({
      include: {
        tradePrice: {
          include: {
            orderStockTradePrice: {
              include: {
                orderStockTradeAltBundle: true,
              },
            },
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
        OR: [{ srcCompanyId: companyId }, { dstCompanyId: companyId }],
      },
    });
    if (!order) throw new NotFoundException('존재하지 않는 주문'); // 모듈 이동시 Exception 생성하여 처리

    const tradePrice =
      order.tradePrice.find((tp) => tp.companyId === companyId) || null;

    return tradePrice;
  }

  async getOrderDeposit(companyId: number, orderId: number) {
    const order = await this.prisma.order.findUnique({
      include: {
        depositEvent: {
          include: {
            deposit: {
              select: DEPOSIT,
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
      (order.srcCompanyId !== companyId && order.dstCompanyId !== companyId)
    )
      throw new NotFoundException(`존재하지 않는 주문입니다.`);

    return order.depositEvent;
  }

  async getOrderProcess(
    companyId: number,
    orderId: number,
  ): Promise<Model.OrderProcess> {
    const orderProcess = await this.prisma.orderProcess.findFirst({
      select: {
        id: true,
        srcLocation: {
          select: LOCATION,
        },
        dstLocation: {
          select: LOCATION,
        },
        order: {
          select: {
            id: true,
            orderNo: true,
            orderType: true,
            status: true,
            isEntrusted: true,
            memo: true,
            srcCompanyId: true,
            dstCompanyId: true,
          },
        },
        isDstDirectShipping: true,
        isSrcDirectShipping: true,
        srcWantedDate: true,
        dstWantedDate: true,
        plan: {
          select: {
            id: true,
            planNo: true,
            type: true,
            status: true,
            assignStockEvent: {
              select: STOCK_EVENT,
            },
            targetStockEvent: {
              select: STOCK_EVENT,
            },
            companyId: true,
          },
        },
        // 외주공정의 주문 원지 정보
        company: {
          select: COMPANY,
        },
        planId: true,
        warehouse: {
          select: WAREHOUSE,
        },
        product: {
          select: PRODUCT,
        },
        packaging: {
          select: PACKAGING,
        },
        grammage: true,
        sizeX: true,
        sizeY: true,
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
        quantity: true,
      },
      where: {
        orderId,
      },
    });

    if (
      !orderProcess ||
      (orderProcess.order.srcCompanyId !== companyId &&
        orderProcess.order.dstCompanyId !== companyId)
    )
      throw new NotFoundException(`존재하지 않는 외주공정 주문입니다.`);

    return Util.serialize(orderProcess);
  }

  async getOrderEtc(
    companyId: number,
    orderId: number,
  ): Promise<Model.OrderEtc> {
    const item = await this.prisma.orderEtc.findFirst({
      select: {
        id: true,
        order: {
          select: {
            id: true,
            orderNo: true,
            orderType: true,
            status: true,
            isEntrusted: true,
            memo: true,
            dstCompanyId: true,
            srcCompanyId: true,
          },
        },
        item: true,
      },
      where: {
        orderId,
      },
    });
    if (
      item.order.dstCompanyId !== companyId &&
      item.order.srcCompanyId !== companyId
    )
      throw new NotFoundException(`존재하지 않는 기타매출 정보입니다.`);

    return item;
  }

  async getOrderRefund(
    companyId: number,
    orderId: number,
  ): Promise<Model.OrderRefund> {
    const item = await this.prisma.orderRefund.findFirst({
      select: {
        id: true,
        order: {
          select: {
            id: true,
            orderNo: true,
            orderType: true,
            status: true,
            isEntrusted: true,
            memo: true,
            dstCompanyId: true,
            srcCompanyId: true,
          },
        },
        originOrderNo: true,
        item: true,
      },
      where: {
        orderId,
      },
    });
    if (
      item.order.dstCompanyId !== companyId &&
      item.order.srcCompanyId !== companyId
    )
      throw new NotFoundException(`존재하지 않는 환불 정보입니다.`);

    return item;
  }

  async getOrderReturn(
    companyId: number,
    orderId: number,
  ): Promise<Model.OrderReturn> {
    const item = await this.prisma.orderReturn.findFirst({
      select: Selector.ORDER_RETURN,
      where: {
        orderId,
      },
    });
    if (
      item.order.dstCompany.id !== companyId &&
      item.order.srcCompany.id !== companyId
    )
      throw new NotFoundException(`존재하지 않는 환불 정보입니다.`);

    return Util.serialize(item);
  }

  async getNotUsingInvoiceCode(): Promise<string> {
    const invoice = await this.prisma.tempInvoiceCode.findFirst();
    return invoice.invoiceCode + String(invoice.number);
  }
}
