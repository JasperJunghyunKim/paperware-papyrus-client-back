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
import { BySecurityResponseDto } from './dto/security.response';
import {
  BySecurityCreateRequestDto,
  BySecurityUpdateRequestDto,
} from './dto/security.request';
import { BySecurityRetriveService } from '../service/by-security-retrive.service';
import { BySecurityChangeService } from '../service/by-security-change.service';

@Controller('/accounted')
export class BySecurityController {
  constructor(
    private readonly bySecurityRetriveService: BySecurityRetriveService,
    private readonly bySecurityChangeService: BySecurityChangeService,
  ) {}

  @Get('accountedType/:accountedType/accountedId/:accountedId/security')
  @UseGuards(AuthGuard)
  async getBySecurity(
    @Request() req: AuthType,
    @Param('accountedType') accountedType: AccountedType,
    @Param('accountedId') accountedId: number,
  ): Promise<BySecurityResponseDto> {
    return await this.bySecurityRetriveService.getBySecurity(
      req.user.companyId,
      accountedType,
      accountedId,
    );
  }

  @Post('accountedType/:accountedType/security')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async createSecurity(
    @Param('accountedType') accountedType: AccountedType,
    @Body() bySecurityCreateRequest: BySecurityCreateRequestDto,
  ): Promise<void> {
    await this.bySecurityChangeService.createBySecurity(
      accountedType,
      bySecurityCreateRequest,
    );
  }

  @Patch('accountedType/:accountedType/accountedId/:accountedId/security')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async updateSecurity(
    @Param('accountedType') accountedType: AccountedType,
    @Param('accountedId') accountedId: number,
    @Body() bySecurityUpdateRequest: BySecurityUpdateRequestDto,
  ): Promise<void> {
    await this.bySecurityChangeService.updateBySecurity(
      accountedType,
      accountedId,
      bySecurityUpdateRequest,
    );
  }

  @Delete('accountedType/:accountedType/accountedId/:accountedId/security')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async deleteSecurity(
    @Param('accountedType') accountedType: AccountedType,
    @Param('accountedId') accountedId: number,
  ): Promise<void> {
    await this.bySecurityChangeService.deleteBySecurity(
      accountedType,
      accountedId,
    );
  }
}
