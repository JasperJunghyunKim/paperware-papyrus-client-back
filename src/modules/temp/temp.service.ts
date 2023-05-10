import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/core";

@Injectable()
export class TempService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async getTradePrice(companyId: number, orderId: number) {
        const order = await this.prisma.order.findFirst({
            include: {
                tradePrice: {
                    include: {
                        orderStockTradePrice: {
                            include: {
                                orderStockTradeAltBundle: true,
                            }
                        }
                    }
                }
            },
            where: {
                id: orderId,
                OR: [
                    { srcCompanyId: companyId },
                    { dstCompanyId: companyId },
                ]
            }
        });
        if (!order) throw new Error('존재하지 않는 주문') // 모듈 이동시 Exception 생성하여 처리

        return order.tradePrice;
    }
}