import { Injectable } from "@nestjs/common";
import { PrismaTransaction } from "src/common/types";

interface StockGroup {
    warehouseId: number;
    productId: number;
    packagingId: number;
    grammage: number;
    sizeX: number;
    sizeY: number;
    paperColorGroupId: number;
    paperColorId: number;
    paperPatternId: number;
    paperCertId: number;
}

@Injectable()
export class StockQuantityCheckerService {

    /** 자사 재고그룹 가용재고 수량 확인 */
    async checkInhouseStockGroupAvaliableQuantityTx(
        tx: PrismaTransaction,
        companyId: number,
        stockGroup: StockGroup,
        quantity: number,
    ) {
        await tx.stock.groupBy({
            by: [
                'warehouseId',
                'productId',
                'packagingId',
                'grammage',
                'sizeX',
                'sizeY',
                'paperColorGroupId',
                'paperColorId',
                'paperPatternId',
                'paperCertId',
            ],
            _sum: {
                cachedQuantityAvailable: true,
            },
            where: {
                warehouseId: stockGroup.warehouseId,
                productId: stockGroup.productId,
                packagingId: stockGroup.packagingId,
                grammage: stockGroup.grammage,
                sizeX: stockGroup.sizeX,
                sizeY: stockGroup.sizeY,
                paperColorGroupId: stockGroup.paperColorGroupId,
                paperColorId: stockGroup.paperColorId,
                paperPatternId: stockGroup.paperPatternId,
                paperCertId: stockGroup.paperCertId,
            }
        });
    }
}