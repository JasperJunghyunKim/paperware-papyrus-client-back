import { Inject, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { isUndefined } from 'lodash';
import * as moment from 'moment';


import { highlight } from 'sql-highlight';

/**
 * 데이터베이스 로거
 */
@Injectable()
export class PrismaLogger {
  private readonly logger = new Logger(PrismaLogger.name);
  /**
   * 생성자
   *
   * @param option 옵션
   */
  constructor(@Inject('DebugMode') private debugMode: boolean) {
    this.debugMode = debugMode;
  }
  /**
   * 로그
   *
   * @param queryEvent 쿼리 이벤트
   */
  query(queryEvent: Prisma.QueryEvent): void {
    const { timestamp, query, params, duration } = queryEvent;

    if (this.debugMode) {
      return;
    }

    this.logger.log('----------------- QUERY START ----------------- ');

    this.logger.log(
      `query: ${highlight(query)} - Took ${duration}ms -Time: ${moment(timestamp).format('YYYY년 MM월 DD일  HH시mm분ss초')} - Params: ${params}`
    );

    this.logger.log('----------------- QUERY END  ----------------- ');
  }

  info(queryEvent: Prisma.QueryEvent): void {
    const { timestamp, query, params, duration } = queryEvent;
    this.logger.log(
      `info: ${highlight(query)} - Took ${duration}ms -Time: ${moment(timestamp).format('YYYY년 MM월 DD일  HH시mm분ss초')} - Params: ${params}`
    );
  }

  warn(queryEvent: Prisma.QueryEvent): void {
    const { timestamp, query, params, duration } = queryEvent;

    this.logger.warn(
      `warn: ${highlight(query)} - Took ${duration}ms -Time: ${moment(timestamp).format('YYYY년 MM월 DD일  HH시mm분ss초')} - Params: ${params}`,
    );
  }

  error(queryEvent: Prisma.QueryEvent & Prisma.LogEvent): void {
    const { timestamp, query, params, duration, target, message } = queryEvent;

    if (!isUndefined(query)) {
      this.logger.error(
        `error: ${highlight(query)} - Took ${duration}ms -Time: ${moment(timestamp).format('YYYY년 MM월 DD일  HH시mm분ss초')} - Params: ${params}`,
      );
    } else {
      this.logger.error(`error: ${message} - target: ${target} -Time: ${moment(timestamp).format('YYYY년 MM월 DD일  HH시mm분ss초')}`);
    }
  }

  /**
   * 디버그 모드를 설정한다.
   *
   * @param debugMode 디버그 모드
   */
  setDebugMode(debugMode: boolean): void {
    this.debugMode = !debugMode;
    this.logger.log('디버그 모드 실행');
  }
}
