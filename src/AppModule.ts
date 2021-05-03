import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validate as envValidate } from './configs/EnvValidation';

// Controllers
import { AccountController } from './controllers/AccountController';
import { LoginController } from './controllers/LoginController';
import { LogoutController } from './controllers/LogoutController';
import { RefreshController } from './controllers/RefreshController';
import { PasswordController } from "./controllers/PasswordController";
import { RegisterController } from './controllers/RegisterController';
import { ValidatorController } from "./controllers/ValidatorController";
// Services
import { Blocklist } from "./services/Blocklist";
import { Logger } from "./services/Logger";
import { Mail } from "./services/Mail";
import { Password } from "./services/Password";
import { Token } from "./services/Token";
// Entities
import { DbSession } from "./entities/DbSession";
import { User } from "./entities/User";
import { ConnectionOptions } from 'typeorm';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: configService.get('DATABASE_TYPE'),
                host: configService.get('DATABASE_HOST'),
                port: configService.get<number>('DATABASE_PORT'),
                username: configService.get('DATABASE_USERNAME'),
                password: configService.get('DATABASE_PASSWORD'),
                database: configService.get('DATABASE_NAME'),
                entities: [DbSession, User],
                entityPrefix: "simple_auth_",
                synchronize: true,
            }  as ConnectionOptions),
            inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([DbSession, User]),
        ConfigModule.forRoot({
            cache: true,
            validate: envValidate
        })
    ],
    controllers: [
        AccountController,
        LoginController,
        LogoutController,
        PasswordController,
        RefreshController,
        RegisterController,
        ValidatorController
    ],
    providers: [
        Blocklist,
        Logger,
        Mail,
        Password,
        Token,
    ],
})
export class AppModule {}
