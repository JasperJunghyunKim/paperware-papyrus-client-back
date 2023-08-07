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
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { BankAccountChangeService } from '../service/bank-account-change.service';
import { BankAccountRetriveService } from '../service/bank-account-retrive.service';
import {
  BankAccountCreateRequestDto,
  BankAccountListDto,
  BankAccountUpdateRequestDto,
} from './dto/bank-account.request';
import { IdDto } from 'src/common/request';
import {
  BankAccountItemResponse,
  BankAccountListResponse,
} from 'src/@shared/api';

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
    @Query() dto: BankAccountListDto,
  ): Promise<BankAccountListResponse> {
    return await this.bankAccountRetriveService.getBankAccountList(
      req.user.companyId,
      dto.skip,
      dto.take,
    );
  }

  @Get('/:id')
  @UseGuards(AuthGuard)
  async getCardItem(
    @Request() req: AuthType,
    @Param() param: IdDto,
  ): Promise<BankAccountItemResponse> {
    return await this.bankAccountRetriveService.getBankAccountItem(
      req.user.companyId,
      param.id,
    );
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

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async deleteBankAccount(
    @Request() req: AuthType,
    @Param() param: IdDto,
  ): Promise<void> {
    await this.bankAccountCahngeService.deleteBankAccount(
      req.user.companyId,
      param.id,
    );
  }
}
