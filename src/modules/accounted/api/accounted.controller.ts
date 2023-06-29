import {
  Controller,
  Get,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AccountedType } from '@prisma/client';
import { AccountedListResponse } from 'src/@shared/api';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { AccountedRetriveService } from '../service/accounted-retrive.service';
import { AccountedRequest } from './dto/accounted.request';

@Controller('/accounted')
export class AccountedController {
  constructor(
    private readonly accountedRetriveService: AccountedRetriveService,
  ) {}

  @Get('accountedType/:accountedType')
  @UseGuards(AuthGuard)
  async getcAccountedList(
    @Request() req: AuthType,
    @Param('accountedType') accountedType: AccountedType,
    @Query() accountedRequest: AccountedRequest,
  ): Promise<AccountedListResponse> {
    return await this.accountedRetriveService.getAccountedList(
      req.user.companyId,
      accountedType,
      accountedRequest,
    );
  }
}
