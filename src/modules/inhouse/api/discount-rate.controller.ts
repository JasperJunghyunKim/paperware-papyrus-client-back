import { Body, Controller, Get, Post, Query, Request, UseGuards } from "@nestjs/common";
import { DiscountRateListResponse } from "src/@shared/api/inhouse/discount-rate.response";
import { AuthGuard } from "src/modules/auth/auth.guard";
import { AuthType } from "src/modules/auth/auth.type";
import { DiscountRateChangeService } from "../service/discount-rate.change.service";
import { DiscountRateRetriveService } from "../service/discount-rate.retrive.service";
import { DiscountRateCreateDto, DiscountRateListDto } from "./dto/discount-rate.request";

@Controller('/discount-rate')
export class DiscountRateController {
    constructor(
        private readonly change: DiscountRateChangeService,
        private readonly retrive: DiscountRateRetriveService,
    ) { }

    @Post('/sales')
    @UseGuards(AuthGuard)
    async createSalesDiscountRate(
        @Request() req: AuthType,
        @Body() dto: DiscountRateCreateDto,
    ) {
        await this.change.createDiscountRate(
            req.user.companyId,
            false,
            dto.companyRegistrationNumber,
            dto.packagingType,
            dto.paperDomainId,
            dto.manufacturerId,
            dto.paperGroupId,
            dto.paperTypeId,
            dto.grammage,
            dto.sizeX,
            dto.sizeY,
            dto.paperColorGroupId,
            dto.paperColorId,
            dto.paperPatternId,
            dto.paperCertId,
            dto.basicDiscountRate,
            dto.specialDiscountRate,
        );
    }

    @Post('/purchase')
    @UseGuards(AuthGuard)
    async createPurchaseDiscountRate(
        @Request() req: AuthType,
        @Body() dto: DiscountRateCreateDto,
    ) {
        await this.change.createDiscountRate(
            req.user.companyId,
            true,
            dto.companyRegistrationNumber,
            dto.packagingType,
            dto.paperDomainId,
            dto.manufacturerId,
            dto.paperGroupId,
            dto.paperTypeId,
            dto.grammage,
            dto.sizeX,
            dto.sizeY,
            dto.paperColorGroupId,
            dto.paperColorId,
            dto.paperPatternId,
            dto.paperCertId,
            dto.basicDiscountRate,
            dto.specialDiscountRate,
        );
    }

    @Get('/sales')
    @UseGuards(AuthGuard)
    async getSalesDiscountRateList(
        @Request() req: AuthType,
        @Query() dto: DiscountRateListDto,
    ): Promise<DiscountRateListResponse> {
        const { conditions, total } = await this.retrive.getList(
            req.user.companyId,
            false,
            dto.companyRegistrationNumber,
            dto.skip,
            dto.take,
        );

        return {
            items: conditions.map(condition => {
                const basic = condition.discountRateMap.find(map => map.discountRateMapType === 'BASIC');
                const special = condition.discountRateMap.find(map => map.discountRateMapType === 'SPECIAL');

                return {
                    id: condition.id,
                    packagingType: condition.packagingType,
                    paperDomain: condition.paperDomain,
                    manufacturer: condition.manufacturer,
                    paperGroup: condition.paperGroup,
                    paperType: condition.paperType,
                    grammage: condition.grammage,
                    sizeX: condition.sizeX,
                    sizeY: condition.sizeY,
                    paperColorGroup: condition.paperColorGroup,
                    paperColor: condition.paperColor,
                    paperPattern: condition.paperPattern,
                    paperCert: condition.paperCert,
                    basicDiscountRate: {
                        discountRate: basic.discountRate,
                        discountRateUnit: basic.discountRateUnit,
                    },
                    specialDiscountRate: {
                        discountRate: special.discountRate,
                        discountRateUnit: special.discountRateUnit,
                    },
                }
            }),
            total,
        };
    }

    @Get('/purchase')
    @UseGuards(AuthGuard)
    async getPurchaseDiscountRateList(
        @Request() req: AuthType,
        @Query() dto: DiscountRateListDto,
    ) {
        const result = await this.retrive.getList(
            req.user.companyId,
            true,
            dto.companyRegistrationNumber,
            dto.skip,
            dto.take,
        );

        return result;
    }
}