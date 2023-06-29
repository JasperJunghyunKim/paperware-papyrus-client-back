import { ConflictException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { TON_TO_GRAM } from "src/common/const";
import { PrismaTransaction } from "src/common/types";

@Injectable()
export class StockQuantityChecker {
  private readonly logger = new Logger(StockQuantityChecker.name);

  async checkStockGroupAvailableQuantityTx(
    tx: PrismaTransaction,
    params: {
      inquiryCompanyId: number;
      companyId: number,
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
    console.log(params);
    const {
      inquiryCompanyId,
      companyId,
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

    const warehouseCondition = warehouseId ? Prisma.sql`s.warehouseId = ${warehouseId}` : Prisma.sql`s.warehouseId IS NULL`;
    const planCondition = planId ? Prisma.sql`s.planId = ${planId}` : Prisma.sql`s.planId IS NULL`;
    const paperColorGroupCondition = paperColorGroupId ? Prisma.sql`s.paperColorGroupId = ${paperColorGroupId}` : Prisma.sql`s.paperColorGroupId IS NULL`;
    const paperColorCondition = paperColorId ? Prisma.sql`s.paperColorId = ${paperColorId}` : Prisma.sql`s.paperColorId IS NULL`;
    const paperPatternCondition = paperPatternId ? Prisma.sql`s.paperPatternId = ${paperPatternId}` : Prisma.sql`s.paperPatternId IS NULL`;
    const paperCertCondition = paperCertId ? Prisma.sql`s.paperCertId = ${paperCertId}` : Prisma.sql`s.paperCertId IS NULL`;
    const isPublicCondition = inquiryCompanyId === companyId ? Prisma.empty : Prisma.sql`AND w.isPublic = ${true} AND s.planId IS NULL`;

    const stockGroups: {
      totalQuantity: any;
      availableQuantity: any;
    }[] = await tx.$queryRaw`
        SELECT IFNULL(SUM(s.cachedQuantity), 0) AS totalQuantity
                , IFNULL(SUM(s.cachedQuantityAvailable), 0) AS availableQuantity
          
          FROM Stock        AS s
      LEFT JOIN Warehouse    AS w ON w.id = s.warehouseId

          WHERE s.companyId = ${companyId}
            AND ${warehouseCondition}
            AND ${planCondition}
            AND s.productId = ${productId}
            AND s.packagingId = ${packagingId}
            AND s.grammage = ${grammage}
            AND s.sizeX = ${sizeX}
            AND s.sizeY = ${sizeY}
            AND ${paperColorGroupCondition}
            AND ${paperColorCondition}
            AND ${paperPatternCondition}
            AND ${paperCertCondition}
            ${isPublicCondition}
        `;

    if (stockGroups.length === 0) throw new NotFoundException(`존재하지 않는 재고그룹 입니다.`);
    const totalQuantity = Number(stockGroups[0].totalQuantity);
    const availableQuantity = Number(stockGroups[0].availableQuantity);

    const stock = await tx.stock.findFirst({
      include: {
        company: true,
        warehouse: true,
        plan: true,
        product: {
          include: {
            paperDomain: true,
            paperGroup: true,
            manufacturer: true,
            paperType: true,
          }
        },
        packaging: true,
        paperColorGroup: true,
        paperColor: true,
        paperPattern: true,
        paperCert: true,
      },
      where: {
        companyId,
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
      }
    });
    console.log(111, stock);

    const inquireCompany = await tx.company.findUnique({
      where: {
        id: inquiryCompanyId,
      }
    })

    this.logger.log(`[재고그룹 수량 조회]
조회회사: ${inquireCompany.businessName}
요청수량: ${stock.packaging.type === 'ROLL' ? (quantity / TON_TO_GRAM) : quantity}
------------------------------------
회사: ${stock.company ? stock.company.businessName : 'NULL'}
포장: ${stock.packaging.name}
창고: ${stock.warehouse ? stock.warehouse.name : 'NULL'}
플랜ID: ${stock.planId ? stock.planId : 'NULL'}
제품ID: ${stock.productId}
제품유형: ${stock.product.paperDomain.name}
지군: ${stock.product.paperGroup.name}
지종: ${stock.product.paperType.name}
제지사: ${stock.product.manufacturer.name}
평량: ${stock.grammage} g/m^2
지폭: ${stock.sizeX} mm
지장: ${stock.sizeY ? (stock.sizeY + ' mm') : 'NULL'}
색군: ${stock.paperColorGroup ? stock.paperColorGroup.name : 'NULL'}
색상: ${stock.paperColor ? stock.paperColor.name : 'NULL'}
무늬: ${stock.paperPattern ? stock.paperPattern.name : 'NULL'}
인증: ${stock.paperCert ? stock.paperCert.name : 'NULL'}
가용수량: ${stock.packaging.type === 'ROLL' ? (availableQuantity / TON_TO_GRAM) : availableQuantity}
총수량: ${stock.packaging.type === 'ROLL' ? (totalQuantity / TON_TO_GRAM) : totalQuantity}
    `)

    if (availableQuantity < quantity) throw new ConflictException(`재고그룹 가용수량이 부족합니다 (요청수량: ${stock.packaging.type === 'ROLL' ? (quantity / TON_TO_GRAM) : quantity} / 가용수량: ${stock.packaging.type === 'ROLL' ? (availableQuantity / TON_TO_GRAM) : availableQuantity})`)
  }
}