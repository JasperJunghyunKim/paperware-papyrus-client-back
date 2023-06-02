import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule, HealthModule, RouteScanModule } from './core';
import { validate } from './core/config/confnig.validator';
import { GlobalExceptionFilter } from './filters';
import { HttpLoggingInterceptor } from './interceptors';
import { BusinessModule } from './modules/business.module';

const configModule = (): DynamicModule => {
  return ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: `.env.${process.env['NODE_ENV']}`,
    validate,
  });
};

@Module({
  imports: [
    configModule(),
    HealthModule,
    RouteScanModule,
    BusinessModule,
    DatabaseModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpLoggingInterceptor,
    },
  ],
})
export class AppModule { }
