import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsName(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsName',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: {
        message: `${propertyName}은 영어,한글,숫자 및 괄호만 사용가능합니다.`,
        ...validationOptions,
      },
      validator: {
        validate(value: any) {
          const regex = /^$|^[ㄱ-ㅎ|가-힣|a-z|A-Z|0-9|()_-\s]+$/;
          return typeof value === 'string' && regex.test(value);
        },
      },
    });
  };
}
