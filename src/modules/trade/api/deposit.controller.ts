import { Body, Controller, ForbiddenException, Get, Param, Post, Query, Request, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/modules/auth/auth.guard";
import { AuthType } from "src/modules/auth/auth.type";
import { DepositCreateDto, OrderDepositListQueryDto } from "./dto/order.request";
import { DepositRetriveService } from "../service/deposit-retrive.service";
import { DepositChangeService } from "../service/deposit-change.service";

@Controller('/deposit')
export class DepositController {
  constructor(
    private readonly retrive: DepositRetriveService,
    private readonly change: DepositChangeService,
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

  /** 보관량 증감 */
  @Post()
  @UseGuards(AuthGuard)
  async createDeposit(
    @Request() req: AuthType,
    @Body() dto: DepositCreateDto,
  ) {
    if (
      dto.srcCompanyId !== req.user.companyId &&
      dto.dstCompanyId !== req.user.companyId
    ) {
      throw new ForbiddenException(
        '매입처와 매출처 중 하나는 귀사로 지정되어야합니다.',
      );
    }

    await this.change.createDeposit({
      ...dto,
    });
  }
}