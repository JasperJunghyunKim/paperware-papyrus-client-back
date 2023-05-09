import { Injectable } from "@nestjs/common";
import { PrismaTransaction } from "src/common/types";
import { ulid } from "ulid";

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
export class OrderService {

    async createNormalSalesTx(
        tx: PrismaTransaction,
        srcCompanyId: number,
        dstCompanyId: number,
        memo: string,
        wantedDate: string,
        locationId: number,
        stockGroup: StockGroup,
        quantity: number,
    ) {
        const order = await tx.order.create({
            data: {
                orderNo: ulid(),
                isEntrusted: true,
                memo,
                wantedDate,
                srcCompany: {
                    connect: {
                        id: srcCompanyId,
                    },
                },
                dstCompany: {
                    connect: {
                        id: dstCompanyId,
                    },
                },
            }
        });

        await tx.orderStock.create({
            data: {
                order: {
                    connect: {
                        id: order.id,
                    }
                },
                dstLocation: {
                    connect: {
                        id: locationId
                    }
                },
            }
        });

        const sg =
            (await tx.stockGroup.findFirst({
                where: {
                    productId: stockGroup.productId,
                    packagingId: stockGroup.packagingId,
                    grammage: stockGroup.grammage,
                    sizeX: stockGroup.sizeX,
                    sizeY: stockGroup.sizeY,
                    paperColorGroupId: stockGroup.paperColorGroupId,
                    paperColorId: stockGroup.paperColorId,
                    paperPatternId: stockGroup.paperPatternId,
                    paperCertId: stockGroup.paperCertId,
                    warehouseId: stockGroup.warehouseId,
                    companyId: srcCompanyId,
                },
            })) ??
            (await tx.stockGroup.create({
                data: {
                    productId: stockGroup.productId,
                    packagingId: stockGroup.packagingId,
                    grammage: stockGroup.grammage,
                    sizeX: stockGroup.sizeX,
                    sizeY: stockGroup.sizeY,
                    paperColorGroupId: stockGroup.paperColorGroupId,
                    paperColorId: stockGroup.paperColorId,
                    paperPatternId: stockGroup.paperPatternId,
                    paperCertId: stockGroup.paperCertId,
                    warehouseId: stockGroup.warehouseId,
                    companyId: srcCompanyId,
                },
            }));

        await tx.stockGroupEvent.create({
            data: {
                change: -quantity,
                status: 'PENDING',
                stockGroupId: sg.id
            }
        })

        return order;
    }

}