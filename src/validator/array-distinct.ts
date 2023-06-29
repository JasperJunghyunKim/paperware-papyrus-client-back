import { registerDecorator, ValidationOptions } from 'class-validator';

/** 배열 중복 체크 validator */
export function ArrayDistinct(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'ArrayDistinct',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: {
        message: `${propertyName}에 중복값이 존재합니다.`,
        ...validationOptions,
      },
      validator: {
        validate(value: any) {
          if (Array.isArray(value)) {
            return new Set(value).size === value.length;
          }
          return false;
        },
      },
    });
  };
}
