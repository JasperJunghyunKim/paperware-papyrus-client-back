import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PlanStatus,
  PlanType,
  Prisma,
  TaskStatus,
  TaskType,
} from '@prisma/client';
import { StockEvent } from 'src/@shared/models';
import { Selector, Util } from 'src/common';
import { STOCK } from 'src/common/selector';
import { PrismaService } from 'src/core';

@Injectable()
export class PlanRetriveService {
  constructor(private prisma: PrismaService) {}

  async getPlanList(params: {
    companyId: number;
    type?: 'INHOUSE' | 'DEFAULT';
    skip?: number;
    take?: number;
    //검색
    planNo: string | null;
    convertingStatus: TaskStatus[];
    guillotineStatus: TaskStatus[];
    releaseStatus: TaskStatus[];
    partnerCompanyRegistrationNumbers: string[];
    minWantedDate: string | null;
    maxWantedDate: string | null;
    arrived: boolean | null;
    warehouseIds: number[];
    packagingIds: number[];
    paperTypeIds: number[];
    manufacturerIds: number[];
    minGrammage: number | null;
    maxGrammage: number | null;
    sizeX: number | null;
    sizeY: number | null;
  }) {
    const { skip, take } = params;
    const type = params.type ?? 'DEFAULT';
    const statusQuery =
      type === 'DEFAULT'
        ? Prisma.sql`p.status IN (${Prisma.join([
            PlanStatus.PROGRESSING,
            PlanStatus.PROGRESSED,
          ])})`
        : Prisma.sql`p.status IN (${Prisma.join([
            PlanStatus.PREPARING,
            PlanStatus.PROGRESSING,
            PlanStatus.PROGRESSED,
          ])})`;
    const typeQuery =
      type === 'DEFAULT'
        ? Prisma.sql`p.type IN (${Prisma.join([
            PlanType.INHOUSE_CREATE,
            PlanType.INHOUSE_MODIFY,
            PlanType.INHOUSE_RELOCATION,
            PlanType.INHOUSE_PROCESS,
            PlanType.INHOUSE_STOCK_QUANTITY_CHANGE,
            PlanType.TRADE_NORMAL_SELLER,
            PlanType.TRADE_NORMAL_BUYER,
            PlanType.TRADE_WITHDRAW_SELLER,
            PlanType.TRADE_WITHDRAW_BUYER,
            PlanType.TRADE_OUTSOURCE_PROCESS_SELLER,
            PlanType.TRADE_OUTSOURCE_PROCESS_BUYER,
          ])})`
        : Prisma.sql`p.type = ${PlanType.INHOUSE_PROCESS}`;

    // 검색적용으로 인한 수정
    // 1. 작업번호
    const planNoQuery = params.planNo
      ? Prisma.sql`AND (CASE 
          WHEN os.id IS NOT NULL OR op.id IS NOT NULL THEN o.orderNo = ${params.planNo}
          ELSE p.planNo = ${params.planNo}
        END)`
      : Prisma.empty;

    // 2. 컨버팅 상태
    params.convertingStatus = Array.from(
      new Set(params.convertingStatus),
    ).filter((s) => Util.inc(s, 'PREPARING', 'PROGRESSING', 'PROGRESSED'));
    const convertingStatusQuery =
      params.convertingStatus.length > 0
        ? Prisma.sql`JOIN (
        SELECT *
          FROM (
            SELECT *, ROW_NUMBER() OVER(PARTITION BY planId) AS rowNum
              FROM Task
             WHERE type = ${TaskType.CONVERTING}
               AND status IN (${Prisma.join(params.convertingStatus)})
          ) AS A
          WHERE A.rowNum = 1
      ) AS convertingCheck ON convertingCheck.planId = p.id`
        : Prisma.empty;

    // 3. 길로틴 상태
    params.guillotineStatus = Array.from(
      new Set(params.guillotineStatus),
    ).filter((s) => Util.inc(s, 'PREPARING', 'PROGRESSING', 'PROGRESSED'));
    const guillotineStatusQuery =
      params.guillotineStatus.length > 0
        ? Prisma.sql`JOIN (
        SELECT *
          FROM (
            SELECT *, ROW_NUMBER() OVER(PARTITION BY planId) AS rowNum
              FROM Task
             WHERE type = ${TaskType.GUILLOTINE}
               AND status IN (${Prisma.join(params.guillotineStatus)})
          ) AS A
          WHERE A.rowNum = 1
      ) AS guillotineCheck ON guillotineCheck.planId = p.id`
        : Prisma.empty;

    // 4. 출고 상태
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
             WHERE type = ${TaskType.RELEASE}
               AND status IN (${Prisma.join(params.releaseStatus)})
          ) AS A
          WHERE A.rowNum = 1
      ) AS releaseCheck ON releaseCheck.planId = p.id`
        : Prisma.empty;

    // 5. 납품처
    const partnerQuery =
      params.partnerCompanyRegistrationNumbers.length > 0
        ? Prisma.sql`AND (
          srcCompany.companyRegistrationNumber IN (${Prisma.join(
            params.partnerCompanyRegistrationNumbers,
          )}) OR
          dstCompany.companyRegistrationNumber IN (${Prisma.join(
            params.partnerCompanyRegistrationNumbers,
          )})
        )`
        : Prisma.empty;

    // 6. 납품 요청일
    const minWantedDateQuery = params.minWantedDate
      ? Prisma.sql`AND (CASE 
          WHEN os.id IS NOT NULL THEN SUBSTR(CONVERT_TZ(os.wantedDate, '+00:00', '+09:00'), 1, 10) >= SUBSTR(CONVERT_TZ(${params.minWantedDate}, '+00:00', '+09:00'), 1, 10)
          WHEN ps.wantedDate IS NOT NULL THEN SUBSTR(CONVERT_TZ(ps.wantedDate, '+00:00', '+09:00'), 1, 10) >= SUBSTR(CONVERT_TZ(${params.minWantedDate}, '+00:00', '+09:00'), 1, 10)
          WHEN p.type = ${PlanType.TRADE_OUTSOURCE_PROCESS_BUYER} THEN SUBSTR(CONVERT_TZ(op.srcWantedDate, '+00:00', '+09:00'), 1, 10) >= SUBSTR(CONVERT_TZ(${params.minWantedDate}, '+00:00', '+09:00'), 1, 10)
          WHEN p.type = ${PlanType.TRADE_OUTSOURCE_PROCESS_SELLER} THEN SUBSTR(CONVERT_TZ(op.dstWantedDate, '+00:00', '+09:00'), 1, 10) >= SUBSTR(CONVERT_TZ(${params.minWantedDate}, '+00:00', '+09:00'), 1, 10)
          ELSE 0=1
        END)`
      : Prisma.empty;
    const maxWantedDateQuery = params.maxWantedDate
      ? Prisma.sql`AND (CASE 
          WHEN os.id IS NOT NULL THEN SUBSTR(CONVERT_TZ(os.wantedDate, '+00:00', '+09:00'), 1, 10) <= SUBSTR(CONVERT_TZ(${params.maxWantedDate}, '+00:00', '+09:00'), 1, 10)
          WHEN ps.wantedDate IS NOT NULL THEN SUBSTR(CONVERT_TZ(ps.wantedDate, '+00:00', '+09:00'), 1, 10) <= SUBSTR(CONVERT_TZ(${params.maxWantedDate}, '+00:00', '+09:00'), 1, 10)
          WHEN p.type = ${PlanType.TRADE_OUTSOURCE_PROCESS_BUYER} THEN SUBSTR(CONVERT_TZ(op.srcWantedDate, '+00:00', '+09:00'), 1, 10) <= SUBSTR(CONVERT_TZ(${params.maxWantedDate}, '+00:00', '+09:00'), 1, 10)
          WHEN p.type = ${PlanType.TRADE_OUTSOURCE_PROCESS_SELLER} THEN SUBSTR(CONVERT_TZ(op.dstWantedDate, '+00:00', '+09:00'), 1, 10) <= SUBSTR(CONVERT_TZ(${params.maxWantedDate}, '+00:00', '+09:00'), 1, 10)
          ELSE 0=1
        END)`
      : Prisma.empty;

    // 7. 수급 여부
    const arrivedQuery = params.arrived === null ? Prisma.empty : Prisma.sql``;

    // 8. 창고
    const warehouseQuery =
      params.arrived === null ? Prisma.empty : Prisma.sql``;

    // 9-1. 포장
    const packagingQuery =
      params.arrived === null ? Prisma.empty : Prisma.sql``;

    // 9-2. 지종
    const paperTypeQuery =
      params.arrived === null ? Prisma.empty : Prisma.sql``;

    // 9-3. 제지사
    const manufacturerQuery =
      params.arrived === null ? Prisma.empty : Prisma.sql``;

    // 9-4. 평량
    const grammageQuery = params.arrived === null ? Prisma.empty : Prisma.sql``;

    // 9-5. 지폭
    const sizeXQuery = params.arrived === null ? Prisma.empty : Prisma.sql``;

    // 9-6. 지장
    const sizeYQuery = params.arrived === null ? Prisma.empty : Prisma.sql``;

    const searchPlans: any[] = await this.prisma.$queryRaw`
      SELECT p.id
            , p.planNo
            , p.type
            , os.id AS orderStockId
            , op.id AS orderProcessId
            , o.id AS orderId
            , o.orderNo AS orderNo
            , srcCompany.companyRegistrationNumber AS srcCompanyRegistrationNumber
            , dstCompany.companyRegistrationNumber AS dstCompanyRegistrationNumber

            , os.wantedDate AS osWantedDate
            , op.srcWantedDate AS opSrcWantedDate
            , op.dstWantedDate AS opDstWantedDate
            , ps.wantedDate AS psWantedDate

            , COUNT(1) OVER() AS total

        FROM Plan           AS p
   LEFT JOIN OrderStock     AS os         ON os.id = p.orderStockId
   LEFT JOIN OrderProcess   AS op         ON op.id = p.orderProcessId
   LEFT JOIN PlanShipping   AS ps         ON ps.planId = p.id
   LEFT JOIN \`Order\`      AS o          ON o.id = (CASE 
                                                      WHEN os.id IS NOT NULL THEN os.orderId
                                                      WHEN op.id IS NOT NULL THEN op.orderId
                                                      ELSE 0
                                                    END)
   LEFT JOIN Company        AS srcCompany ON srcCompany.id = o.srcCompanyId
   LEFT JOIN Company        AS dstCompany ON dstCompany.id = o.dstCompanyId

        ${convertingStatusQuery}
        ${guillotineStatusQuery}
        ${releaseStatusQuery}

       WHERE p.companyId = ${params.companyId}
         AND p.isDeleted = ${false}
         AND ${statusQuery}
         AND ${typeQuery}
         ${planNoQuery}
         ${partnerQuery}
         ${minWantedDateQuery}
         ${maxWantedDateQuery}
         ${arrivedQuery}
         ${warehouseQuery}
         ${packagingQuery}
         ${paperTypeQuery}
         ${manufacturerQuery}
         ${grammageQuery}
         ${sizeXQuery}
         ${sizeYQuery}

      LIMIT ${skip}, ${take}
    `;
    console.log(111111, searchPlans);
    throw new BadRequestException('test');

    // OLD...
    return await this.prisma.plan.findMany({
      select: {
        ...Selector.PLAN,
        task: {
          select: {
            status: true,
            type: true,
          },
        },
      },
      where: {
        companyId: params.companyId,
        isDeleted: false,
        status: {
          notIn:
            type === 'INHOUSE' ? ['CANCELLED'] : ['CANCELLED', 'PREPARING'],
        },
        type: {
          in: type === 'INHOUSE' ? ['INHOUSE_PROCESS'] : undefined,
          notIn: ['INHOUSE_STOCK_QUANTITY_CHANGE'],
        },
      },
      skip,
      take,
    });
  }

  async getPlanListCount(params: { companyId: number }) {
    return await this.prisma.plan.count({
      where: {
        companyId: params.companyId,
        status: {
          notIn: ['CANCELLED', 'PREPARING'],
        },
      },
    });
  }

  async getPlanById(id: number) {
    return await this.prisma.plan.findUnique({
      select: Selector.PLAN,
      where: {
        id,
      },
    });
  }

  async getPlanInputList(params: {
    planId: number;
    skip?: number;
    take?: number;
  }): Promise<StockEvent[]> {
    const { planId, skip, take } = params;

    const planInput = await this.prisma.stockEvent.findMany({
      select: Selector.STOCK_EVENT,
      where: {
        plan: {
          id: planId,
        },
        status: 'NORMAL',
      },
      skip,
      take,
      orderBy: {
        id: 'desc',
      },
    });

    return planInput.map(Util.serialize);
  }

  async getPlanInputCount(params: { planId: number }) {
    const { planId } = params;

    const count = await this.prisma.stockEvent.count({
      where: {
        plan: {
          id: planId,
        },
        status: 'NORMAL',
      },
    });

    return count;
  }

  async getInputStock(companyId: number, planId: number, stockId: number) {
    const plan = await this.prisma.plan.findUnique({
      where: {
        id: planId,
      },
      select: {
        status: true,
        type: true,
        companyId: true,
        targetStockEvent: {
          where: {
            stockId,
            status: 'NORMAL',
          },
          select: {
            stockId: true,
            change: true,
            useRemainder: true,
            stock: {
              select: STOCK,
            },
          },
        },
      },
    });

    if (plan.companyId !== companyId || plan.targetStockEvent.length === 0)
      throw new NotFoundException(`실투입 재고가 존재하지 않습니다.`);

    return {
      stockId: plan.targetStockEvent[0].stockId,
      quantity: Math.abs(plan.targetStockEvent[0].change),
      useRemainder: plan.targetStockEvent[0].useRemainder,
      stock: plan.targetStockEvent[0].stock,
    };
  }
}
