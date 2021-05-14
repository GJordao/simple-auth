import 'reflect-metadata';

import { plainToClass, Type } from 'class-transformer';
import {
    IsDefined,
    IsIn,
    IsInt,
    IsNotEmpty,
    IsPort,
    IsPositive,
    ValidateIf,
    validateSync,
    Length
} from 'class-validator';
import {
    IsDefinedAndNotEmptyIfIsMysqlOrPostgres,
    IsPortIfIsMysqlOrPostgres
} from './Decorators';

export class EnvironmentVariables {
    @IsIn(['mysql', 'postgres', 'test'])
    @IsDefined()
    @IsNotEmpty()
    DATABASE_TYPE: string;

    @IsDefinedAndNotEmptyIfIsMysqlOrPostgres()
    DATABASE_HOST: string;

    @IsPortIfIsMysqlOrPostgres()
    @IsDefinedAndNotEmptyIfIsMysqlOrPostgres()
    @Type(() => Number)
    DATABASE_PORT: number;

    @IsDefinedAndNotEmptyIfIsMysqlOrPostgres()
    DATABASE_USERNAME: string;

    @IsDefinedAndNotEmptyIfIsMysqlOrPostgres()
    DATABASE_PASSWORD: string;

    @IsDefinedAndNotEmptyIfIsMysqlOrPostgres()
    DATABASE_NAME: string;

    PASSWORD_PEPPER = '';

    @IsPositive()
    @IsInt()
    @Type(() => Number)
    PORT = 5000;

    @IsDefined()
    @IsNotEmpty()
    TOKEN_ENCRYPTION_KEY: string;

    @IsInt()
    @Type(() => Number)
    ACCESS_TOKEN_EXPIRE_TIME = 600;

    @IsPositive()
    @IsInt()
    @Type(() => Number)
    REFRESH_TOKEN_EXPIRE_TIME = 2629743;

    @IsIn(['prod', 'dev', 'test'])
    MODE = 'prod';

    SMTP_HOST = '';

    @IsPositive()
    @IsInt()
    @ValidateIf((o) => !!o.SMTP_HOST)
    @IsDefined()
    @IsNotEmpty()
    @Type(() => Number)
    SMTP_PORT: number;

    @Type(() => Boolean)
    SMTP_SECURE = false;

    @ValidateIf((o) => !!o.SMTP_HOST)
    @IsDefined()
    @IsNotEmpty()
    SMTP_USER: string;

    @ValidateIf((o) => !!o.SMTP_HOST)
    @IsDefined()
    @IsNotEmpty()
    SMTP_PASSWORD: string;

    @ValidateIf((o) => !!o.SMTP_HOST)
    @IsDefined()
    @IsNotEmpty()
    SMTP_MAIL_FROM: string;

    @ValidateIf((o) => !!o.SMTP_HOST)
    @IsDefined()
    @IsNotEmpty()
    AUTH_URL: string;

    ACCOUNT_CONFIRMATION_REDIRECT_URL = '';

    @Type(() => Boolean)
    DB_SESSIONS = false;

    @ValidateIf((o) => !!o.SMTP_HOST)
    @IsDefined()
    @IsNotEmpty()
    PASSWORD_RESET_URL: string;

    @IsIn(['debug', 'info', 'warn', 'error'])
    LOG_LEVEL = 'info';

    @Type(() => Boolean)
    FILE_LOGGING = true;

    @ValidateIf((o) => o.LOG_FILE_ENABLED)
    @Length(1, 50)
    LOG_FOLDER_PREFIX = 'sa_';
}

export function validate(config: Record<string, unknown>) {
    const validatedConfig = plainToClass(EnvironmentVariables, config, {
        enableImplicitConversion: true
    });
    const errors = validateSync(validatedConfig, {
        skipMissingProperties: false
    });

    if (errors.length > 0) {
        const msgs = errors.map((err) => Object.values(err.constraints)[0]);
        const errorMsg = msgs.join(', ');

        throw new Error(`Error loading environment variables. ${errorMsg}`);
    }

    return validatedConfig;
}
