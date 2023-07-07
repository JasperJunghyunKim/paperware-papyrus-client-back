import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import {
  DepositCreateDto,
  OrderDepositListQueryDto,
} from './dto/order.request';
import { DepositRetriveService } from '../service/deposit-retrive.service';
import { DepositChangeService } from '../service/deposit-change.service';
import { DepositHistoryResponse } from 'src/@shared/api';
import { Util } from 'src/common';

@Controller('/deposit')
export class DepositController {
  constructor(
    private readonly retrive: DepositRetriveService,
    private readonly change: DepositChangeService,
  ) {}

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
      packagingIds: Util.searchKeywordsToIntArray(dto.packagingIds),
      paperTypeIds: Util.searchKeywordsToIntArray(dto.paperTypeIds),
      manufacturerIds: Util.searchKeywordsToIntArray(dto.manufacturerIds),
    });

    return result;
  }

  /** 매입/매출 보관량 상세조회 */
  @Get('/:id')
  @UseGuards(AuthGuard)
  async getDepositHistory(
    @Request() req: AuthType,
    @Param('id') id: number,
  ): Promise<DepositHistoryResponse> {
    const result = await this.retrive.getDepositHistory(id, req.user.companyId);
    return result;
  }

  /** 보관량 증감 */
  @Post()
  @UseGuards(AuthGuard)
  async createDeposit(@Request() req: AuthType, @Body() dto: DepositCreateDto) {
    await this.change.createDeposit({
      companyId: req.user.companyId,
      ...dto,
    });
  }
}
