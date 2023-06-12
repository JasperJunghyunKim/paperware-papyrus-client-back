import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core';
import { StockChangeService } from './stock-change.service';
import { ulid } from 'ulid';

@Injectable()
export class StockArrivalChangeService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly stock: StockChangeService,
    ) { }

    async applyStockArrival(planId: number, companyId: number, warehouseId: number) {
        await this.prisma.$transaction(async (tx) => {
            const warehouse = await tx.warehouse.findFirst({
                where: {
                    id: warehouseId,
                    companyId,
                    isDeleted: false,
                },
            });
            if (!warehouse) throw new NotFoundException(`존재하지 않는 창고입니다.`);



            // await this.stock.cacheStockQuantityTx(tx, {
            //     id: newStock.id,
            // });



        });
    }
}
