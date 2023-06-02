import { registerDecorator, ValidationOptions } from 'class-validator';

/** 배열 중복 체크 validator */
export function IsAnyOrId(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'IsAnyOrId',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [],
            options: {
                message: `${propertyName}은 문자열 any 또는 양의 정수이어야 합니다.`,
                ...validationOptions,
            },
            validator: {
                validate(value: any) {
                    switch (value) {
                        case 'any':
                            return true;
                        default:
                            const v = Number(value)
                            if (
                                Number.isNaN(v) ||
                                !Number.isInteger(v) ||
                                v < 1
                            ) {
                                return false;
                            } else {
                                return true;
                            }
                    }
                },
            },
        });
    };
}