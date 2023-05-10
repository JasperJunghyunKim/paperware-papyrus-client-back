import { Body, Controller, Get, NotImplementedException, Param, Put, Request, UseGuards } from "@nestjs/common";
import { TradePriceResponse } from "src/@shared/api";
import { AuthGuard } from "../auth/auth.guard";
import { AuthType } from "../auth/auth.type";
import { OrderIdDto, UpdateTradePriceDto } from "./dto/temp.request";
import { TempService } from "./temp.service";

@Controller('/trade')
export class TempController {
    constructor(
        private readonly tempService: TempService,
    ) { }

    @Get('/:orderId/price')
    @UseGuards(AuthGuard)
    async getTradePrice(
        @Request() req: AuthType,
        @Param() dto: OrderIdDto,
    ): Promise<TradePriceResponse> {
        return await this.tempService.getTradePrice(req.user.companyId, dto.orderId);
    }

    @Put('/:orderId/price')
    @UseGuards(AuthGuard)
    async updateTradePrice(
        @Request() req: AuthType,
        @Param() parmDto: OrderIdDto,
        @Body() dto: UpdateTradePriceDto,
    ) {
        await this.tempService.updateTradePrice(
            req.user.companyId,
            parmDto.orderId,
            dto,
        )
    }
}