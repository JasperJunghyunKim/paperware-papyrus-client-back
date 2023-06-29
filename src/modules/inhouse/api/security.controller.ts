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
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import { SecurityChangeService } from '../service/security-change.service';
import { SecurityRetriveService } from '../service/security-retrive.service';
import {
  SecurityCreateRequestDto,
  SecurityUpdateRequestDto,
  SecurityUpdateStatusRequestDto,
} from './dto/security.request';
import {
  SecurityItemResponseDto,
  SecurityListResponseDto,
} from './dto/security.response';

@Controller('/security')
export class SecurityController {
  constructor(
    private readonly securityRetriveService: SecurityRetriveService,
    private readonly securityCahngeService: SecurityChangeService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async getSecurityList(
    @Request() req: AuthType,
  ): Promise<SecurityListResponseDto> {
    return await this.securityRetriveService.getSecurityList(
      req.user.companyId,
    );
  }

  @Get(':securityId')
  @UseGuards(AuthGuard)
  async getSecurityItem(
    @Param('securityId') securityId: number,
  ): Promise<SecurityItemResponseDto> {
    return await this.securityRetriveService.getSecurityItem(securityId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async createSecurity(
    @Request() req: AuthType,
    @Body() securityCreateRequest: SecurityCreateRequestDto,
  ): Promise<void> {
    await this.securityCahngeService.createSecurity(
      req.user.companyId,
      securityCreateRequest,
    );
  }

  @Patch(':securityId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async updateSecurity(
    @Param('securityId') securityId: number,
    @Body() securityUpdateRequest: SecurityUpdateRequestDto,
  ): Promise<void> {
    await this.securityCahngeService.updateSecurity(
      securityId,
      securityUpdateRequest,
    );
  }

  @Patch(':securityId/status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async updateSecurityStatus(
    @Param('securityId') securityId: number,
    @Body() securityUpdateStatusRequest: SecurityUpdateStatusRequestDto,
  ): Promise<void> {
    await this.securityCahngeService.updateSecurityStatus(
      securityId,
      securityUpdateStatusRequest,
    );
  }

  @Delete(':securityId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async deleteSecurity(@Param('securityId') securityId: number): Promise<void> {
    await this.securityCahngeService.deleteSecurity(securityId);
  }
}
