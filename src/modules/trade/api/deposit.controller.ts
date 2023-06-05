import { Controller, Get, Param, Query, Request, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/modules/auth/auth.guard";
import { AuthType } from "src/modules/auth/auth.type";
import { OrderDepositListQueryDto } from "./dto/order.request";
import { DepositRetriveService } from "../service/deposit-retrive.service";

@Controller('/deposit')
export class DepositController {
    constructor(
        private readonly retrive: DepositRetriveService,
    ) { }

    /** 매입/매출 보관량 조회 */
    @Get()
    @UseGuards(AuthGuard)
    async getDepositList(
        @Request() req: AuthType,
        @Query() dto: OrderDepositListQueryDto,
    ) {
        const result = await this.retrive.getDepositList({
            companyId: req.user.companyId,
            ...dto,
        });

        return result;
    }

    /** 매입/매출 보관량 상세조회 */
    @Get('/:id')
    @UseGuards(AuthGuard)
    async getDepositHistory(
        @Request() req: AuthType,
        @Param('id') id: number,
    ) {
        const result = await this.retrive.getDepositHistory(id, req.user.companyId);
        return result;
    }
}