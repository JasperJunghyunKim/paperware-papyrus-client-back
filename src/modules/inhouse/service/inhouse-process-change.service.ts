import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/core";
import { StockQuantityChecker } from "src/modules/stock/service/stock-quantity-checker";

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

      // 재고 생성

    });
  }
}