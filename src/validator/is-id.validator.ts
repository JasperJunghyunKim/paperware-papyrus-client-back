import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsId(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsId',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: {
        message: `${propertyName}은 영어, 숫자, _ 만 사용가능합니다.`,
        ...validationOptions,
      },
      validator: {
        validate(value: any) {
          const regex = /^[a-z|A-Z|0-9|_]+$/;
          return typeof value === 'string' && regex.test(value);
        },
      },
    });
  };
}
