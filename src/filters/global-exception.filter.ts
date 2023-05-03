import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { AppError, toStringify } from 'src/@shared';

/**
 * 글로벌 에러 필터이다.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor() { }

  catch(exception: unknown & Error, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    let message = '요청을 처리하던 중 예상하지 못한 오류가 발생했습니다. \n 관리자에게 문의해주세요.';
    let code = 'Unknown Code';
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let statusMessage = HttpStatus[HttpStatus.INTERNAL_SERVER_ERROR];

    // 미리 정의된 예외라면..
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      statusMessage = HttpStatus[statusCode];
      const errorData = exception.getResponse();

      // 오류코드를 사용한 에러(IError)라면...
      if (!(typeof errorData === 'string')) {
        const iError = errorData as AppError;
        code = iError.code;
        message = toStringify({
          message: iError.message,
          error: iError.msgArgs,
        });
      }
      // application 및 runtime(모든) 에러 정의
    } else {
      this.logger.error(exception, {
        context: GlobalExceptionFilter.name,
        trace: exception?.stack,
      });
    }

    response.status(statusCode).json({
      error: {
        statusCode,
        statusMessage,
        message,
        code,
      },
    });
  }
}
