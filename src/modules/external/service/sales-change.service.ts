import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/core";
import { BusinessRelationshipRetriveService } from "src/modules/inhouse/service/business-relationship-retrive.service";
import { LocationRetriveService } from 'src/modules/inhouse/service/location-retrive.service';
import { SalesError } from "../infrastructure/constants/sales-error.enum";
import { PartnerNotFoundException } from "../infrastructure/exception/partner-notfound.exception";
import { Warehouse } from 'src/@shared/models';
import { LocationNotFoundException } from "../infrastructure/exception/location-notfound.exception";
import { InvalidLocationException } from "../infrastructure/exception/invalid-location.exception";
import { StockQuantityCheckerService } from "src/modules/stock/service/stock-quantity-checker.service";
import { PlanChangeService } from "src/modules/working/service/plan-change.service";
import { ulid } from "ulid";
import { OrderStatus } from "@prisma/client";
import { OrderService } from "./order.service";

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
export class SalesChangeService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly businessRelationshipRetriveService: BusinessRelationshipRetriveService,
        private readonly locationRetriveService: LocationRetriveService,
        private readonly stockQuantityCheckerService: StockQuantityCheckerService,
        private readonly planChangeService: PlanChangeService,
        private readonly orderService: OrderService,
    ) { }

    private validateLocation(location: Warehouse, locationId: number, srcCompanyId: number, dstCompanyId: number) {
        if (
            !location ||
            (location.company.id !== srcCompanyId && location.company.id !== dstCompanyId) ||
            (location.company.id === dstCompanyId && !location.isPublic)
        ) throw new LocationNotFoundException(SalesError.SALES002, [locationId]);

        if (location.company.id === srcCompanyId && location.isPublic) throw new InvalidLocationException(SalesError.SALES003, [locationId]);
    }

    async createNormal(
        srcCompanyId: number,
        dstCompanyId: number,
        locationId: number,
        memo: string,
        wantedDate: string,
        quantity: number,
        stockGroup: StockGroup,
    ) {
        await this.prisma.$transaction(async (tx) => {
            // 거래처 확인
            const relationship = await this.businessRelationshipRetriveService.getItem({
                srcCompanyId,
                dstCompanyId,
            });
            if (!relationship) throw new PartnerNotFoundException(SalesError.SALES001, [dstCompanyId]);

            // 장소 확인
            const location = await this.locationRetriveService.getItem(locationId);
            this.validateLocation(location, locationId, srcCompanyId, dstCompanyId);

            // 재고 확인
            await this.stockQuantityCheckerService.checkInhouseStockGroupAvaliableQuantityTx(
                tx,
                srcCompanyId,
                stockGroup,
                quantity,
            );

            // 데이터 생성
            // order
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

            // order stock
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


            throw new BadRequestException('test')

        });
    }

}