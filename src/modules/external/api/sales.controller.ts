import { Body, Controller, NotImplementedException, Post, Request, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/modules/auth/auth.guard";
import { AuthType } from "src/modules/auth/auth.type";
import { SalesChangeService } from "../service/sales-change.service";
import { SalesRetriveService } from "../service/sales-retrive.service";
import { CreateNormalSalesDto } from "./dto/sales.resquest";

@Controller('/sales')
export class SalesController {
    constructor(
        private readonly salesRetriveService: SalesRetriveService,
        private readonly salesChangeService: SalesChangeService,
    ) { }

    // 조회

    // 변경
    @UseGuards(AuthGuard)
    @Post('/normal')
    async createNormal(
        @Request() req: AuthType,
        @Body() dto: CreateNormalSalesDto,
    ) {
        await this.salesChangeService.createNormal();
    }
}