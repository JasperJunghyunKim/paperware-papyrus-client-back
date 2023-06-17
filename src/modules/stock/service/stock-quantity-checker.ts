import { Injectable } from "@nestjs/common";
import { PrismaTransaction } from "src/common/types";

@Injectable()
export class StockQuantityChecker {
    async checkStockGroupAvailableQuantityTx(
        tx: PrismaTransaction,
        params: {
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

        // TODO...
        const stockGroup = await tx.$queryRaw`
            
        `;
    }
}