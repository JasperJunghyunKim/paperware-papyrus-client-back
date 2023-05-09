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
} from '@nestjs/common';
import { UserChangeService } from '../service/user-change.service';
import { UserRetriveService } from '../service/user-retrive.service';

/**
 * 사용자 컨트롤러이다.
 */
@Controller('users')
export class UserController {
  /**
   * 생성자
   *
   * @param userRetriveService 사용자 서비스
   */
  constructor(
    private readonly userRetriveService: UserRetriveService,
    private readonly userChangeService: UserChangeService,
  ) {}

  /**
   * 전제 사용자 목록을 조회한다.
   *
   * @param userId 사용자식별자
   * @param userNm 사용자명
   * @param res 응답 데이터
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getList(): Promise<Array<any>> {
    return await this.userRetriveService.findAll();
  }

  /**
   * 특정 사용자를 조회한다.
   *
   * @param userId 사용자식별자
   * @param res 응답 데이터
   */
  @Get(':userId')
  @HttpCode(HttpStatus.CREATED)
  async get(@Param('userId') userId: number) {
    return await this.userRetriveService.find(userId);
  }

  /**
   * 신규 사용자를 등록한다.
   *
   * @param userRequest 요청 데이터
   * @param res 응답 데이터
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() userRequest: any) {
    await this.userChangeService.save(userRequest);
  }

  /**
   * 특정 사용자를 변경한다.
   *
   * @param userId 사용자식별자
   * @param userRequest 요청 데이터
   * @param res 응답 데이터
   */
  @Put(':userId')
  @HttpCode(HttpStatus.OK)
  async update(@Param('userId') userId: number, @Body() userRequest: any) {
    await this.userChangeService.modify(userId, userRequest);
  }

  /**
   * 특정 사용자를 변경한다.
   *
   * @param userId 사용자식별자
   * @param userRequest 요청 데이터
   * @param res 응답 데이터
   */
  @Patch(':userId')
  @HttpCode(HttpStatus.OK)
  async patch(@Param('userId') userId: number, @Body() userRequest: any) {
    await this.userChangeService.modify(userId, userRequest);
  }

  /**
   * 특정 사용자를 삭제한다.
   *
   * @param userId 사용자식별자
   * @param res 응답 데이터
   */
  @Delete(':userId')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('userId') userId: number) {
    await this.userChangeService.delete(userId);
  }
}
