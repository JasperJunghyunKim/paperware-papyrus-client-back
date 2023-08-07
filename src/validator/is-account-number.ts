import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsAccountNumber(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsAccountNumber',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: {
        message: `${propertyName}은 숫자, - 만 사용가능합니다.`,
        ...validationOptions,
      },
      validator: {
        validate(value: any) {
          const regex = /^[0-9|-]+$/;
          return typeof value === 'string' && regex.test(value);
        },
      },
    });
  };
}
