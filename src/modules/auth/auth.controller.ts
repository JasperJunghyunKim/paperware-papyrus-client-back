import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  NotImplementedException,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './auth.dto';
import {
  SendSmsAuthenticationDto,
  AuthNoCheckDto,
  FindIdDto,
  FindPasswordDto,
  FindPasswordChangeDto,
} from './dto/auth.request';
import {
  FindIdResponse,
  LoginResponse,
} from 'src/@shared/api/auth/auth.response';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signIn(@Body() signInDto: SignInDto): Promise<LoginResponse> {
    return this.authService.signIn(signInDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/sms')
  async sendSmsAuthentication(@Body() body: SendSmsAuthenticationDto) {
    return await this.authService.sendSmsAuthentication(body.phoneNo);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/authNo')
  async checkSmsAuthentication(@Body() body: AuthNoCheckDto) {
    return await this.authService.checkAuthNo(body.phoneNo, body.authNo);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/find/id')
  async findId(@Body() dto: FindIdDto): Promise<FindIdResponse> {
    return await this.authService.findId({ ...dto });
  }

  @HttpCode(HttpStatus.OK)
  @Post('/find/password')
  async findPassword(@Body() dto: FindPasswordDto) {
    return await this.authService.findPassword({ ...dto });
  }

  @HttpCode(HttpStatus.OK)
  @Post('/find/password/change')
  async findPasswordAndChange(@Body() dto: FindPasswordChangeDto) {
    return await this.authService.findPasswordChange({ ...dto });
  }
}
