import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AccountedType } from '@prisma/client';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { ByBankAccountChangeService } from '../service/by-bank-account-change.service';
import { ByBankAccountRetriveService } from '../service/by-bank-account-retrive.service';
import {
  ByBankAccountCreateRequestDto,
  ByBankAccountUpdateRequestDto,
} from './dto/bank-account.request';
import { ByBankAccountItemResponseDto } from './dto/bank-account.response';
import { AccountedTypeDto } from './dto/accounted.request';
import { IdDto } from 'src/common/request';

@Controller('/accounted')
export class ByBankAccountController {
  constructor(
    private readonly byBankAccountRetriveService: ByBankAccountRetriveService,
    private readonly byBankAccountChangeService: ByBankAccountChangeService,
  ) {}

  @Get('accountedType/:accountedType/accountedId/:accountedId/bank-account')
  @UseGuards(AuthGuard)
  async getByBankAccount(
    @Request() req: AuthType,
    @Param('accountedType') accountedType: AccountedType,
    @Param('accountedId') accountedId: number,
  ): Promise<ByBankAccountItemResponseDto> {
    return await this.byBankAccountRetriveService.getByBankAccount(
      req.user.companyId,
      accountedType,
      accountedId,
    );
  }

  @Post('accountedType/:accountedType/bank-account')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async createByBankAccount(
    @Request() req: AuthType,
    @Param() param: AccountedTypeDto,
    @Body() byBankAccountCreateRequest: ByBankAccountCreateRequestDto,
  ): Promise<void> {
    await this.byBankAccountChangeService.createBankAccount(
      req.user.companyId,
      param.accountedType,
      byBankAccountCreateRequest,
    );
  }

  @Patch('accountedType/:accountedType/accountedId/:id/bank-account')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async updateByBankAccount(
    @Request() req: AuthType,
    @Param() idParam: IdDto,
    @Param() typeParam: AccountedTypeDto,
    @Body() byBankAccountUpdateRequest: ByBankAccountUpdateRequestDto,
  ): Promise<void> {
    await this.byBankAccountChangeService.updateBankAccount(
      req.user.companyId,
      typeParam.accountedType,
      idParam.id,
      byBankAccountUpdateRequest,
    );
  }

  @Delete('accountedType/:accountedType/accountedId/:accountedId/bank-account')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async deleteByBankAccount(
    @Param('accountedType') accountedType: AccountedType,
    @Param('accountedId') accountedId: number,
  ): Promise<void> {
    await this.byBankAccountChangeService.deleteBankAccount(
      accountedType,
      accountedId,
    );
  }
}
