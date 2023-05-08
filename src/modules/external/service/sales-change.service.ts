import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/core";
import { BusinessRelationshipRetriveService } from "src/modules/inhouse/service/business-relationship-retrive.service";

interface StockGroup {
    warehouseId: number;
    productId: number;
    packageingId: number;
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
        private readonly businessRelationshipRetriveService: BusinessRelationshipRetriveService
    ) { }

    async createNormal(
        userId: number,
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
            console.log(1111, relationship)

            // 장소 확인


            // 재고 확인

            // 데이터 생성
        });
    }

}