import { Injectable } from "@nestjs/common";
import { Util } from "src/common";
import { PrismaService } from "src/core";
import { StockQuantityChecker } from "src/modules/stock/service/stock-quantity-checker";
import { ulid } from "ulid";

@Injectable()
export class InhouseProcessChangeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stockQuantityChecker: StockQuantityChecker,
  ) { }

  async create(
    params: {
      companyId: number;
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
    }
  ) {
    const {
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

    await this.prisma.$transaction(async tx => {
      // 부모재고 가용수량 체크
      await this.stockQuantityChecker.checkStockGroupAvailableQuantityTx(tx, {
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
      });

      const company = await tx.company.findUnique({
        where: {
          id: companyId,
        }
      });

      const plan = await tx.plan.create({
        data: {
          planNo: ulid(),
          type: 'INHOUSE_PROCESS',
          company: {
            connect: {
              id: company.id
            }
          },
        }
      });

      // 원지 재고 생성
      const stock = await tx.stock.create({
        data: {
          serial: Util.serialP(company.invoiceCode),
          companyId: companyId,
          initialPlanId: plan.id,
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
          cachedQuantity: -quantity,
          stockEvent: {
            create: {
              change: -quantity,
              status: 'PENDING',
              assignPlan: {
                connect: {
                  id: plan.id,
                }
              }
            }
          }
        },
      });

    });
  }
}