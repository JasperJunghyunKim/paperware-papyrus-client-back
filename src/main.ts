import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { CONFIG_KEY } from './core/constants/config';
import helmet from 'helmet';
import compression from 'compression';
import { winstonConfig } from './core';

declare const module: any;
const logger = new Logger(bootstrap.name);

async function bootstrap() {
  try {
    // 익스프레스 서버 생성
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      cors: true,
      logger: winstonConfig(process.env['NODE_ENV']),
    });

    app.enableCors({
      origin: 'http://localhost:3001',
    });

    // 환경변수 서비스
    const configService = app.get(ConfigService);

    // 파이프 인터셉터, 컴프레션 설정
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

    // 운영환경일 경우...
    if (configService.get(CONFIG_KEY.COMMON.NODE_ENV) === 'prod') {
      app.enable('trust proxy');
      app.use(compression());
      app.use(helmet()); // TODO: helment 설치
    }

    // 서버 종료 훅을 활성화
    app.enableShutdownHooks();

    // 서버 실행
    const port = configService.get(CONFIG_KEY.COMMON.PORT);
    // 쿠키 사용
    app.listen(port);
    logger.log(`🚀  Server is listening on port ${port.toString()}`);

    // 모듈 핫리로딩
    if (module.hot) {
      module.hot.accept();
      module.hot.dispose(() => app.close());
    }
  } catch (e) {
    logger.error(`❌  Error starting server, ${e}`);
    process.exit();
  }
}
bootstrap();
