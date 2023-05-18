import { Body, Controller, Post, Request, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/modules/auth/auth.guard";
import { AuthType } from "src/modules/auth/auth.type";
import { DiscountRateChangeService } from "../service/discount-rate.change.service";
import { DiscountRateRetriveService } from "../service/discount-rate.retrive.service";
import { DiscountRateCreateDto } from "./dto/discount-rate.request";

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

}