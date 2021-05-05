import { Logger } from '@nestjs/common';
import { plainToClass, Type } from 'class-transformer';
import { IsDefined, IsIn, IsInt, IsNotEmpty, IsPort, IsPositive, ValidateIf, validateSync } from 'class-validator';


class EnvironmentVariables {
    @IsIn(["mysql", "postgres"])
    @IsDefined() @IsNotEmpty()
    DATABASE_TYPE: string;

    @IsDefined() @IsNotEmpty()
    DATABASE_HOST: string;
    
    @IsPort()
    @IsDefined() @IsNotEmpty()
    DATABASE_PORT: string;

    @IsDefined() @IsNotEmpty()
    DATABASE_USERNAME: string;

    @IsDefined() @IsNotEmpty()
    DATABASE_PASSWORD: string;

    @IsDefined() @IsNotEmpty()
    DATABASE_NAME: string;

    PASSWORD_PEPPER = '';

    @IsPort()
    PORT = '5000';

    @IsDefined() @IsNotEmpty()
    TOKEN_ENCRYPTION_KEY: string;

    @IsInt() @Type(() => Number)
    ACCESS_TOKEN_EXPIRE_TIME = 600;

    @IsPositive() @IsInt() @Type(() => Number)
    REFRESH_TOKEN_EXPIRE_TIME = 2629743;

    @IsIn(['prod', 'dev'])
    MODE = 'prod';

    SMTP_HOST = '';

    @IsPort()
    @ValidateIf(o => !!o.SMTP_HOST)
    @IsDefined() @IsNotEmpty()
    SMTP_PORT = '25';

    @Type(() => Boolean)
    SMTP_SECURE = false;

    @ValidateIf(o => !!o.SMTP_HOST)
    @IsDefined() @IsNotEmpty()
    SMTP_USER = '';

    @ValidateIf(o => !!o.SMTP_HOST)
    @IsDefined() @IsNotEmpty()
    SMTP_PASSWORD = '';

    @ValidateIf(o => !!o.SMTP_HOST)
    @IsDefined() @IsNotEmpty()
    SMTP_MAIL_FROM = '';

    @ValidateIf(o => !!o.SMTP_HOST)
    @IsDefined() @IsNotEmpty()
    AUTH_URL = '';

    ACCOUNT_CONFIRMATION_REDIRECT_URL = '';

    @Type(() => Boolean)
    DB_SESSIONS = false;

    @ValidateIf(o => !!o.SMTP_HOST)
    @IsDefined() @IsNotEmpty()
    PASSWORD_RESET_URL: string;
}

export function validate(config: Record<string, unknown>) {
    const logger = new Logger('ConfigModule');
    logger.log(`Validating environment variables`);

    const validatedConfig = plainToClass(
        EnvironmentVariables,
        config,
        { enableImplicitConversion: true },
    );
    const errors = validateSync(validatedConfig, { skipMissingProperties: false });

    if (errors.length > 0) {
        const msgs = errors.map(err=>Object.values(err.constraints)[0]);
        const errorMsg = msgs.join(', ');

        logger.error(`${errorMsg}`);
        throw new Error('Error loading environment variables.');
    }

    return validatedConfig;
}
