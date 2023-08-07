import {
  Controller,
  Get,
  Param,
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
  AccountedRequest,
  AccountedTypeDto,
  AccountedUnpaidListDto,
} from './dto/accounted.request';
import { Util } from 'src/common';
import { IdDto } from 'src/common/request';

@Controller('/accounted')
export class AccountedController {
  constructor(
    private readonly accountedRetriveService: AccountedRetriveService,
  ) {}

  @Get('accountedType/:accountedType')
  @UseGuards(AuthGuard)
  async getcAccountedList(
    @Request() req: AuthType,
    @Param() param: AccountedTypeDto,
    @Query() accountedRequest: AccountedRequest,
  ): Promise<AccountedListResponse> {
    return await this.accountedRetriveService.getAccountedList(
      req.user.companyId,
      param.accountedType,
      accountedRequest,
    );
  }

  @Get('accountedType/:accountedType/accountId/:id')
  @UseGuards(AuthGuard)
  async get(
    @Request() req: AuthType,
    @Param() typeParam: AccountedTypeDto,
    @Param() idParam: IdDto,
  ) {}

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
}
