import { createParamDecorator } from '@nestjs/common';
/**
 * 사용자 인증 데코레이터
 */
export const AuthUser = createParamDecorator((data, request) => request.user);
