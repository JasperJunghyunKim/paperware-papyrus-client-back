import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './auth.dto';
import { SendSmsAuthenticationDto, AuthNoCheckDto } from './dto/auth.request';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signIn(@Body() signInDto: SignInDto) {
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
}
