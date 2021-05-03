import { Logger } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { IsBoolean, IsDefined, IsNotEmpty, IsNumber, IsString, validateSync } from 'class-validator';

class EnvironmentVariables {
    @IsDefined()
    @IsNotEmpty()
    DATABASE_TYPE: string;

    @IsDefined()
    @IsNotEmpty()
    DATABASE_HOST: string;

    @IsDefined()
    @IsNotEmpty()
    DATABASE_PORT: number;

    @IsDefined()
    @IsNotEmpty()
    DATABASE_USERNAME: string;

    @IsDefined()
    @IsNotEmpty()
    DATABASE_PASSWORD: string;

    @IsDefined()
    @IsNotEmpty()
    DATABASE_NAME: string;

    @IsString()
    PASSWORD_PEPPER = '';

    @IsNumber()
    PORT = 5000;

    @IsDefined()
    @IsNotEmpty()
    TOKEN_ENCRYPTION_KEY: string;

    @IsNumber()
    ACCESS_TOKEN_EXPIRE_TIME = 600;

    @IsNumber()
    REFRESH_TOKEN_EXPIRE_TIME = 2629743;

    @IsString()
    MODE = 'prod';

    @IsString()
    SMTP_HOST = '';

    @IsNumber()
    SMTP_PORT = 25;

    @IsBoolean()
    SMTP_SECURE = false;

    @IsString()
    SMTP_USER = '';

    @IsString()
    SMTP_PASSWORD = '';

    @IsString()
    SMTP_MAIL_FROM = '';

    @IsString()
    AUTH_URL = '';

    @IsString()
    ACCOUNT_CONFIRMATION_REDIRECT_URL = '';

    @IsBoolean()
    DB_SESSIONS = false;

    @IsDefined()
    @IsNotEmpty()
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
