import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsOnlyNumber(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsOnlyNumber',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: {
        message: `${propertyName}은 숫자만 사용가능합니다.`,
        ...validationOptions,
      },
      validator: {
        validate(value: any) {
          const regex = /^$|^[0-9]+$/;
          return typeof value === 'string' && regex.test(value);
        },
      },
    });
  };
}
