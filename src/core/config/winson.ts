import * as moment from 'moment';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import { config, format, transports } from 'winston';

const { errors, combine, timestamp, prettyPrint, json } = format;

/**
 * 윈스턴 환경 설정
 *
 * @param env 환경
 * @returns 로거 설정
 *
 * @description createLogger에 format이랑 console 레벨에 format은 다르다.
 * console 기준으로 갈것
 */
export const winstonConfig = (env: string): any => {
  return WinstonModule.createLogger({
    levels: config.npm.levels,
    format: combine(
      errors({ stack: true }),
      timestamp({ format: 'YYYY년 MM월 DD일  HH시mm분ss초' }),
      prettyPrint(),
      json(),
      nestWinstonModuleUtilities.format.nestLike(`paperware-client - ${env}`, {
        prettyPrint: true,
        colors: true,
      }),
    ),
    transports: [
      new transports.File({
        level: 'error',
        filename: `error-${moment(new Date()).format('YYYY-MM-DD')}.log`,
        dirname: 'logs',
        zippedArchive: true,
        maxsize: 5000000,
      }),
      new transports.File({
        level: 'info',
        filename: `application-${moment(new Date()).format('YYYY-MM-DD')}.log`,
        dirname: 'logs',
        zippedArchive: true,
        maxsize: 5000000,
      }),
      new transports.Console({
        level: 'silly',
      }),
    ],
  });
};
