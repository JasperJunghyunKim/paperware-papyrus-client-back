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
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { BankAccountChangeService } from '../service/bank-account-change.service';
import { BankAccountRetriveService } from '../service/bank-account-retrive.service';
import {
  BankAccountCreateRequestDto,
  BankAccountUpdateRequestDto,
} from './dto/bank-account.request';
import {
  BankAccountItemResponseDto,
  BankAccountListResponseDto,
} from './dto/bank-account.response';
import { IdDto } from 'src/common/request';

@Controller('/bank-account')
export class BankAccountController {
  constructor(
    private readonly bankAccountRetriveService: BankAccountRetriveService,
    private readonly bankAccountCahngeService: BankAccountChangeService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async getBankAccountList(
    @Request() req: AuthType,
  ): Promise<BankAccountListResponseDto> {
    return await this.bankAccountRetriveService.getBankAccountList(
      req.user.companyId,
    );
  }

  @Get('/:id')
  @UseGuards(AuthGuard)
  async getCardItem(
    @Param() param: IdDto,
  ): Promise<BankAccountItemResponseDto> {
    return await this.bankAccountRetriveService.getBankAccountItem(param.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async createBankAccount(
    @Request() req: AuthType,
    @Body() dto: BankAccountCreateRequestDto,
  ) {
    await this.bankAccountCahngeService.createBankAccount({
      companyId: req.user.companyId,
      ...dto,
    });
  }

  @Put('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async updateBankAccount(
    @Request() req: AuthType,
    @Param() param: IdDto,
    @Body() dto: BankAccountUpdateRequestDto,
  ): Promise<void> {
    await this.bankAccountCahngeService.updateBankAccount({
      companyId: req.user.companyId,
      bankAccountId: param.id,
      ...dto,
    });
  }

  @Delete(':accountId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async deleteBankAccount(
    @Param('accountId') accountId: number,
  ): Promise<void> {
    await this.bankAccountCahngeService.deleteBankAccount(accountId);
  }
}
