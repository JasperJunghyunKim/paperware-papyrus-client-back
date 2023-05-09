import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    // TODO 기존 도메인 분리작업 완료되면 추후에 passport 적용
    // PassportModule.registerAsync({
    //   imports: [ConfigModule],
    //   useFactory: async (configService: ConfigService) => ({ defaultStrategy: configService.get('jwt') }),
    //   inject: [ConfigService],
    // }),
    // JwtModule.registerAsync({
    //   imports: [ConfigModule],
    //   useFactory: async (configService: ConfigService) => ({
    //     global: true,
    //     secret: configService.get(CONFIG_KEY.COMMON.JWT_SECRET),
    //     signOptions: { expiresIn: configService.get(CONFIG_KEY.COMMON.JWT_EXPIRES_IN) },
    //   }),
    //   inject: [ConfigService],
    // }),
    JwtModule.register({
      global: true,
      secret: 'secret',
      signOptions: { expiresIn: '30d' },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
