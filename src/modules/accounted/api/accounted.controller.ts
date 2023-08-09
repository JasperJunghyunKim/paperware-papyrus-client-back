import {
  Body,
  Controller,
  Get,
  NotImplementedException,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AccountedType, Method, Subject } from '@prisma/client';
import {
  AccountedItemResponse,
  AccountedListResponse,
  AccountedUnpaidListResponse,
} from 'src/@shared/api';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { AccountedRetriveService } from '../service/accounted-retrive.service';
import {
  AccountedByBankAccountCreatedDto,
  AccountedByBankAccountUpdateDto,
  AccountedByCardCreatedDto,
  AccountedByCashCreatedDto,
  AccountedByCashUpdateDto,
  AccountedByOffsetCreatedDto,
  AccountedBySecurityCreatedDto,
  AccountedListDto,
  AccountedUnpaidListDto,
} from './dto/accounted.request';
import { Util } from 'src/common';
import { AccountedChangeService } from '../service/accounted-change.service';
import { IdDto } from 'src/common/request';

@Controller('/accounted')
export class AccountedController {
  constructor(
    private readonly accountedRetriveService: AccountedRetriveService,
    private readonly change: AccountedChangeService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async getList(
    @Request() req: AuthType,
    @Query() dto: AccountedListDto,
  ): Promise<AccountedListResponse> {
    return await this.accountedRetriveService.getList({
      companyId: req.user.companyId,
      ...dto,
      companyRegistrationNumbers: Util.searchKeywordsToStringArray(
        dto.companyRegistrationNumbers,
      ),
      accountedSubjects: Util.searchKeywordsToStringArray(
        dto.accountedSubjects,
      ) as Subject[],
      accountedMethods: Util.searchKeywordsToStringArray(
        dto.accountedMethods,
      ) as Method[],
    });
  }

  /** 미수금/미지급 목록 */
  @Get('/unpaid')
  @UseGuards(AuthGuard)
  async getUnpaidList(
    @Request() req: AuthType,
    @Query() dto: AccountedUnpaidListDto,
  ): Promise<AccountedUnpaidListResponse> {
    return await this.accountedRetriveService.getUnpaidList({
      companyId: req.user.companyId,
      ...dto,
      companyRegistrationNumbers: Util.searchKeywordsToStringArray(
        dto.companyRegistrationNumbers,
      ),
    });
  }

  @Get('/:id')
  @UseGuards(AuthGuard)
  async get(
    @Request() req: AuthType,
    @Param() param: IdDto,
  ): Promise<AccountedItemResponse> {
    return await this.accountedRetriveService.get(req.user.companyId, param.id);
  }

  /** 계좌이체 등록 */
  @Post('/bank-account')
  @UseGuards(AuthGuard)
  async createByBankAccount(
    @Request() req: AuthType,
    @Body() dto: AccountedByBankAccountCreatedDto,
  ) {
    return await this.change.createByBankAccount({
      companyId: req.user.companyId,
      ...dto,
    });
  }

  /** 유가증권 등록 */
  @Post('/security')
  @UseGuards(AuthGuard)
  async createBySecurity(
    @Request() req: AuthType,
    @Body() dto: AccountedBySecurityCreatedDto,
  ) {
    dto.validate();
    return await this.change.createBySecurity({
      companyId: req.user.companyId,
      ...dto,
    });
  }

  /** 현금 등록 */
  @Post('/cash')
  @UseGuards(AuthGuard)
  async createByCash(
    @Request() req: AuthType,
    @Body() dto: AccountedByCashCreatedDto,
  ) {
    return await this.change.createByCash({
      companyId: req.user.companyId,
      ...dto,
    });
  }

  /** 카드입금 등록 */
  @Post('/card')
  @UseGuards(AuthGuard)
  async createByCard(
    @Request() req: AuthType,
    @Body() dto: AccountedByCardCreatedDto,
  ) {
    dto.validate();
    return await this.change.createByCard({
      companyId: req.user.companyId,
      ...dto,
      vatPrice: dto.vatPrice || 0,
    });
  }

  /** 상계 등록 */
  @Post('/offset')
  @UseGuards(AuthGuard)
  async createByOffset(
    @Request() req: AuthType,
    @Body() dto: AccountedByOffsetCreatedDto,
  ) {
    return await this.change.createByOffset({
      companyId: req.user.companyId,
      ...dto,
    });
  }

  /** 기타 등록 */
  @Post('/etc')
  @UseGuards(AuthGuard)
  async createByEtc(
    @Request() req: AuthType,
    @Body() dto: AccountedByCashCreatedDto,
  ) {
    return await this.change.createByCash({
      companyId: req.user.companyId,
      ...dto,
    });
  }

  /** 계좌이체 수정 */
  @Put('/:id/bank-account')
  @UseGuards(AuthGuard)
  async updateByBank(
    @Request() req: AuthType,
    @Param() param: IdDto,
    @Body() body: AccountedByBankAccountUpdateDto,
  ) {
    return await this.change.updateByBankAccount({
      companyId: req.user.companyId,
      accountedId: param.id,
      ...body,
    });
  }

  /** 유가증권 수정 */
  @Put('/:id/security')
  @UseGuards(AuthGuard)
  async updateBySecurity(@Request() req: AuthType, @Param() param: IdDto) {
    throw new NotImplementedException();
  }

  /** 카드입금 수정 */
  @Put('/:id/card')
  @UseGuards(AuthGuard)
  async updateByCard(@Request() req: AuthType, @Param() param: IdDto) {
    throw new NotImplementedException();
  }

  /** 현금 수정 */
  @Put('/:id/cash')
  @UseGuards(AuthGuard)
  async updateByCash(
    @Request() req: AuthType,
    @Param() param: IdDto,
    @Body() body: AccountedByCashUpdateDto,
  ) {
    return await this.change.updateByCash({
      companyId: req.user.companyId,
      accountedId: param.id,
      ...body,
    });
  }

  /** 상계 수정 */
  @Put('/:id/offset')
  @UseGuards(AuthGuard)
  async updateByOffset(@Request() req: AuthType, @Param() param: IdDto) {
    throw new NotImplementedException();
  }

  /** 유가증권 수정 */
  @Put('/:id/etc')
  @UseGuards(AuthGuard)
  async updateByEtc(@Request() req: AuthType, @Param() param: IdDto) {
    throw new NotImplementedException();
  }
}
