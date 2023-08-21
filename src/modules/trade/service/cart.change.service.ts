import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CartType } from '@prisma/client';
import { PrismaService } from 'src/core';
import { StockQuantityChecker } from 'src/modules/stock/service/stock-quantity-checker';

@Injectable()
export class CartChangeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stockQuantityChecker: StockQuantityChecker,
  ) {}

  async create(params: {
    userId: number;
    userCompanyId: number;
    type: CartType;
    companyId: number;
    warehouseId: number | null;
    planId: number | null;
    productId: number;
    packagingId: number;
    grammage: number;
    sizeX: number;
    sizeY: number | null;
    paperColorGroupId: number | null;
    paperColorId: number | null;
    paperPatternId: number | null;
    paperCertId: number | null;
    quantity: number;
    memo: string | null;
  }) {
    if (
      params.type === 'PURCHASE' &&
      params.userCompanyId === params.companyId
    ) {
      throw new BadRequestException(`자사재고는 구매할 수 없습니다.`);
    }
    if (params.type === 'SALES' && params.userCompanyId !== params.companyId) {
      throw new BadRequestException(`자사 재고를 선택해 주세요.`);
    }
    await this.prisma.$transaction(async (tx) => {
      // TODO: company => 거래관계 확인

      // 재고 수량 확인
      await this.stockQuantityChecker.checkStockGroupAvailableQuantityTx(tx, {
        inquiryCompanyId: params.userCompanyId,
        companyId: params.companyId,
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

      await tx.cart.create({
        data: {
          type: params.type,
          userId: params.userId,
          companyId: params.companyId,
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
          memo: params.memo || '',
        },
      });
    });
  }

  async delete(userId: number, cartId: number) {
    await this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findFirst({
        where: {
          id: cartId,
          userId,
          isDeleted: false,
        },
      });
      if (!cart)
        throw new NotFoundException(`존재하지 않는 장바구니 품목입니다.`);

      await tx.cart.update({
        where: {
          id: cartId,
        },
        data: {
          isDeleted: true,
        },
      });
    });
  }
}
