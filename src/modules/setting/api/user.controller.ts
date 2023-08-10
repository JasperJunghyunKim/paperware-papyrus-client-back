import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotImplementedException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { SettingUserRetriveService } from '../service/user.retrive.service';
import { SettingUserChangeService } from '../service/user.change.service';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { AuthType } from 'src/modules/auth/auth.type';
import {
  SettingUserCreateDto,
  SettingUserIdCheckDto,
  SettingUserListDto,
  SettingUserUpdateDto,
  UserActivatedUpdateDto,
  UserMenuUpdateDto,
} from './dto/user.request';
import {
  SettingUserListReseponse,
  SettingUserResponse,
  UserIdCheckResponse,
  UserMemuResponse,
} from 'src/@shared/api/setting/user.response';
import { IdDto } from 'src/common/request';

@Controller('/setting/user')
export class SettingUserController {
  constructor(
    private readonly retrive: SettingUserRetriveService,
    private readonly change: SettingUserChangeService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async getList(
    @Request() req: AuthType,
    @Query() query: SettingUserListDto,
  ): Promise<SettingUserListReseponse> {
    return await this.retrive.getList(
      req.user.companyId,
      query.skip,
      query.take,
    );
  }

  @Get('/:id')
  @UseGuards(AuthGuard)
  async get(
    @Request() req: AuthType,
    @Param() param: IdDto,
  ): Promise<SettingUserResponse> {
    return await this.retrive.get(req.user.companyId, param.id);
  }

  @Get('/id/check')
  @UseGuards(AuthGuard)
  async checkId(
    @Request() req: AuthType,
    @Query() query: SettingUserIdCheckDto,
  ): Promise<UserIdCheckResponse> {
    return await this.retrive.chekcId(query.username);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async create(@Request() req: AuthType, @Body() body: SettingUserCreateDto) {
    const user = await this.retrive.get(req.user.companyId, req.user.id);
    if (!user.isAdmin) throw new ForbiddenException();

    return await this.change.create({
      companyId: req.user.companyId,
      ...body,
    });
  }

  @Post('/:id/admin')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async updateAdmin(@Request() req: AuthType, @Param() param: IdDto) {
    const user = await this.retrive.get(req.user.companyId, req.user.id);
    if (!user.isAdmin) throw new ForbiddenException();

    return await this.change.updateAdmin(req.user.companyId, param.id);
  }

  @Put('/:id')
  @UseGuards(AuthGuard)
  async update(
    @Request() req: AuthType,
    @Param() param: IdDto,
    @Body() body: SettingUserUpdateDto,
  ) {
    const user = await this.retrive.get(req.user.companyId, req.user.id);
    if (!user.isAdmin) throw new ForbiddenException();

    return await this.change.update({
      companyId: req.user.companyId,
      userId: param.id,
      ...body,
    });
  }

  @Patch('/:id/activated')
  @UseGuards(AuthGuard)
  async updateActivated(
    @Request() req: AuthType,
    @Param() param: IdDto,
    @Body() body: UserActivatedUpdateDto,
  ) {
    const user = await this.retrive.get(req.user.companyId, req.user.id);
    if (!user.isAdmin) throw new ForbiddenException();

    return await this.change.updateUserActivated(
      req.user.companyId,
      param.id,
      body.isActivated,
    );
  }

  @Put('/:id/menu')
  @UseGuards(AuthGuard)
  async updateMenu(
    @Request() req: AuthType,
    @Param() param: IdDto,
    @Body() body: UserMenuUpdateDto,
  ) {
    return await this.change.updateUserMenu(
      req.user.id,
      req.user.companyId,
      param.id,
      body.menu,
    );
  }

  @Get('/:id/menu')
  @UseGuards(AuthGuard)
  async getMenu(
    @Request() req: AuthType,
    @Param() param: IdDto,
  ): Promise<UserMemuResponse> {
    return await this.retrive.getMenu(req.user.companyId, param.id);
  }
}
