import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsPassword',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: {
        message: `${propertyName}는 영문,숫자,특수문자를 조합하여 10~30자리로 입력해주세요.`,
        ...validationOptions,
      },
      validator: {
        validate(value: any) {
          const reg: RegExp =
            /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{10,30}$/;
          return reg.test(value);
        },
      },
    });
  };
}
