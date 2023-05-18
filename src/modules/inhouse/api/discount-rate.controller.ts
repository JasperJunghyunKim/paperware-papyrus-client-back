import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, UseGuards } from "@nestjs/common";
import { DiscountRateListResponse, DiscountRateResponse } from "src/@shared/api/inhouse/discount-rate.response";
import { AuthGuard } from "src/modules/auth/auth.guard";
import { AuthType } from "src/modules/auth/auth.type";
import { DiscountRateChangeService } from "../service/discount-rate.change.service";
import { DiscountRateRetriveService } from "../service/discount-rate.retrive.service";
import { DiscountRateConditionIdDto, DiscountRateCreateDto, DiscountRateListDto, DiscountRateUpdateDto } from "./dto/discount-rate.request";

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
    ): Promise<DiscountRateListResponse> {
        const { conditions, total } = await this.retrive.getList(
            req.user.companyId,
            true,
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

    @Get('/sales/:discountRateConditionId')
    @UseGuards(AuthGuard)
    async getSalesDiscountRate(
        @Request() req: AuthType,
        @Param() dto: DiscountRateConditionIdDto,
    ): Promise<DiscountRateResponse> {
        const condition = await this.retrive.get(
            req.user.companyId,
            false,
            dto.discountRateConditionId,
        );

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
    }

    @Get('/purchase/:discountRateConditionId')
    @UseGuards(AuthGuard)
    async getPurchaseDiscountRate(
        @Request() req: AuthType,
        @Param() dto: DiscountRateConditionIdDto,
    ): Promise<DiscountRateResponse> {
        const condition = await this.retrive.get(
            req.user.companyId,
            true,
            dto.discountRateConditionId,
        );

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
    }

    @Put('/sales/:discountRateConditionId')
    @UseGuards(AuthGuard)
    async updateSalesDiscountRate(
        @Request() req: AuthType,
        @Param() param: DiscountRateConditionIdDto,
        @Body() dto: DiscountRateUpdateDto,
    ) {
        await this.change.updateDiscountRate(
            req.user.companyId,
            false,
            param.discountRateConditionId,
            dto.basicDiscountRate,
            dto.specialDiscountRate,
        );
    }

    @Put('/purchase/:discountRateConditionId')
    @UseGuards(AuthGuard)
    async updatePurchaseDiscountRate(
        @Request() req: AuthType,
        @Param() param: DiscountRateConditionIdDto,
        @Body() dto: DiscountRateUpdateDto,
    ) {
        await this.change.updateDiscountRate(
            req.user.companyId,
            true,
            param.discountRateConditionId,
            dto.basicDiscountRate,
            dto.specialDiscountRate,
        );
    }

    @Delete('/sales/:discountRateConditionId')
    @UseGuards(AuthGuard)
    async deleteSalesDiscountRate(
        @Request() req: AuthType,
        @Param() param: DiscountRateConditionIdDto,
    ) {
        await this.change.deleteDiscountRate(
            req.user.companyId,
            false,
            param.discountRateConditionId,
        );
    }

    @Delete('/purchase/:discountRateConditionId')
    @UseGuards(AuthGuard)
    async deletePurchaseDiscountRate(
        @Request() req: AuthType,
        @Param() param: DiscountRateConditionIdDto,
    ) {
        await this.change.deleteDiscountRate(
            req.user.companyId,
            true,
            param.discountRateConditionId,
        );
    }
}