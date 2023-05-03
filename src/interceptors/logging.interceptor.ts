import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { isNil } from 'lodash';
import * as moment from 'moment';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

/**
 * 로깅 인터 셉터이다.
 */
@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpLoggingInterceptor.name);

  /**
   * 생성자
   */
  constructor() { }

  /**
   * 인터셉트
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request: Request = context.switchToHttp().getRequest();
    this.logger.log(
      `Request - HTTP Method: [START - ${request.method}] Request URL: ${(request as any).originalUrl} Time: ${moment().format(
        'YYYY년 MM월 DD일  HH시mm분ss초',
      )}`,
    );
    return next.handle().pipe(
      catchError((err: any) =>
        throwError(() => {
          if (!isNil(err?.response)) {
            const msg = `Code: ${err.response.code} Message: ${err.response.message}`;

            this.logger.error(
              `Error: HTTP Method - [ERROR - ${request.method}] Request URL: ${(request as any).originalUrl} Time: ${moment().format(
                'YYYY년 MM월 DD일  HH시mm분ss초',
              )} ${msg}`,
              {
                trace: err.stack,
                args: err.response.msgArgs,
              },
            );
          } else {
            this.logger.error(err, {
              trace: err.stack,
            });
          }

          return err;
        }),
      ),
      finalize(() => {
        this.logger.log(
          `Response - HTTP Method: [END - ${request.method}] Request URL: ${(request as any).originalUrl} Time: ${moment().format(
            'YYYY년 MM월 DD일  HH시mm분ss초',
          )}`,
        );
      }),
    );
  }
}
