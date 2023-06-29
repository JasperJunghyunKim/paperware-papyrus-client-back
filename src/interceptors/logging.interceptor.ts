import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { isNil } from 'lodash';
import * as moment from 'moment';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { Util } from 'src/@shared/helper';

/**
 * 로깅 인터 셉터이다.
 */
@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpLoggingInterceptor.name);

  /**
   * 인터셉트
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request: Request = context.switchToHttp().getRequest();
    this.logger.log(
      `Request - HTTP Method: [START - ${request.method}] Request URL: ${
        (request as any).originalUrl
      } Time: ${moment().format('YYYY년 MM월 DD일  HH시mm분ss초')}`,
    );
    return next.handle().pipe(
      catchError((err: any) =>
        throwError(() => {
          if (!isNil(err?.response)) {
            // eslint-disable-next-line prettier/prettier
            const msg = `Code: ${
              err.response.code
            } Message: ${Util.formatString(
              err.response.message,
              err.response.msgArgs,
            )}`;

            this.logger.error(
              `Error: HTTP Method - [ERROR - ${request.method}] Request URL: ${
                (request as any).originalUrl
              } Time: ${moment().format(
                'YYYY년 MM월 DD일  HH시mm분ss초',
              )} ${Util.formatString(msg, err.response.msgArgs)}`,
              {
                trace: Util.formatString(err.stack, err.response.msgArgs),
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
          `Response - HTTP Method: [END - ${request.method}] Request URL: ${
            (request as any).originalUrl
          } Time: ${moment().format('YYYY년 MM월 DD일  HH시mm분ss초')}`,
        );
      }),
    );
  }
}
