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
  UseGuards
} from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { BankAccountChangeService } from '../service/bank-account-change.service';
import { BankAccountRetriveService } from '../service/bank-account-retrive.service';
import { BankAccountCreateRequestDto, BankAccountUpdateRequestDto } from './dto/bank-account.request';
import { BankAccountResponseDto } from './dto/bank-account.response';

@Controller('/bank-account')
export class BankAccountController {
  constructor(
    private readonly bankAccountRetriveService: BankAccountRetriveService,
    private readonly bankAccountCahngeService: BankAccountChangeService,
  ) { }

  @Get()
  @UseGuards(AuthGuard)
  async getBankAccountList(
    @Request() req: AuthType,
  ): Promise<BankAccountResponseDto[]> {
    return await this.bankAccountRetriveService.getBankAccountList(req.user.companyId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async createBankAccount(@Request() req: AuthType, @Body() cardCreateRequest: BankAccountCreateRequestDto): Promise<void> {
    await this.bankAccountCahngeService.createBankAccount(req.user.companyId, cardCreateRequest);
  }

  @Patch(':accountId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async updateBankAccount(
    @Param('accountId') accountId: number,
    @Body() cardUpdateRequest: BankAccountUpdateRequestDto,
  ): Promise<void> {
    await this.bankAccountCahngeService.updateBankAccount(accountId, cardUpdateRequest);
  }

  @Delete(':accountId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async deleteBankAccount(@Param('accountId') accountId: number): Promise<void> {
    await this.bankAccountCahngeService.deleteBankAccount(accountId);
  }
}
