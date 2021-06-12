import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions
} from 'class-validator';

export function IsDefinedAndNotEmptyIfIsMysqlOrPostgres(
    property?: string,
    validationOptions?: ValidationOptions
) {
    return function (object: any, propertyName: string) {
        let message;
        const validate = function (value: any, args: ValidationArguments) {
            const databaseType = args.object['DATABASE_TYPE'];

            if (
                ['postgres', 'mysql'].includes(databaseType) &&
                [undefined, null, ''].includes(value)
            ) {
                message = `${args.property} should be defined and not empty if DATABASE_TYPE is either 'postgres' or 'mysql'`;
                return false;
            }
            if (
                databaseType === 'test' &&
                ![undefined, null, ''].includes(value)
            ) {
                message = `${args.property} should be undefined or empty if DATABASE_TYPE is 'test'`;
                return false;
            }
            return true;
        };
        const defaultMessage = function () {
            return message;
        };

        registerDecorator({
            name: 'IsDefinedAndNotEmptyIfIsMysqlOrPostgres',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [property],
            options: validationOptions,
            validator: {
                validate,
                defaultMessage
            }
        });
    };
}

export function IsPortIfIsMysqlOrPostgres(
    property?: string,
    validationOptions?: ValidationOptions
) {
    return function (object: any, propertyName: string) {
        let message;

        const validate = function (value: any, args: ValidationArguments) {
            const databaseType = args.object['DATABASE_TYPE'];

            if (
                ['postgres', 'mysql'].includes(databaseType) &&
                !(
                    Number.isInteger(value) &&
                    parseInt(value) >= 0 &&
                    parseInt(value) < 65353
                )
            ) {
                message = `${args.property} should be a valid port number [0, 65353]`;
                return false;
            } else return true;
        };
        const defaultMessage = function () {
            return message;
        };

        registerDecorator({
            name: 'isPortIfIsMysqlOrPostgres',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [property],
            options: validationOptions,
            validator: {
                validate,
                defaultMessage
            }
        });
    };
}
