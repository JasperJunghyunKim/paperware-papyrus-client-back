import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AccountedType } from '@prisma/client';
import {
  AccountedListResponse,
  AccountedUnpaidListResponse,
} from 'src/@shared/api';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { AccountedRetriveService } from '../service/accounted-retrive.service';
import {
  AccountedByBankAccountCreatedDto,
  AccountedTypeDto,
  AccountedUnpaidListDto,
} from './dto/accounted.request';
import { Util } from 'src/common';
import { AccountedChangeService } from '../service/accounted-change.service';

@Controller('/accounted')
export class AccountedController {
  constructor(
    private readonly accountedRetriveService: AccountedRetriveService,
    private readonly change: AccountedChangeService,
  ) {}

  @Get('accountedType/:accountedType')
  @UseGuards(AuthGuard)
  async getcAccountedList(
    @Request() req: AuthType,
    @Param() param: AccountedTypeDto,
    @Query() accountedRequest: any,
  ): Promise<AccountedListResponse> {
    return await this.accountedRetriveService.getAccountedList(
      req.user.companyId,
      param.accountedType,
      accountedRequest,
    );
  }

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
}
