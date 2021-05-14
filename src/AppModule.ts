import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
    ConfigModule,
    ConfigServiceApi,
    validate as envValidate,
    EnvironmentVariables
} from './Config';

// Controllers
import { AccountController } from './controllers/AccountController';
import { LoginController } from './controllers/LoginController';
import { LogoutController } from './controllers/LogoutController';
import { RefreshController } from './controllers/RefreshController';
import { PasswordController } from './controllers/PasswordController';
import { RegisterController } from './controllers/RegisterController';
import { ValidatorController } from './controllers/ValidatorController';
// Services
import { Blocklist } from './services/Blocklist';
import { Mail } from './services/Mail';
import { Password } from './services/Password';
import { Token } from './services/Token';
import { LoggerWinstonModule } from './logger/LoggerWinstonModule';
// Entities
import { DbSession } from './entities/DbSession';
import { User } from './entities/User';
import { ConnectionOptions } from 'typeorm';

@Module({})
export class AppModule {
    static register(config: EnvironmentVariables): DynamicModule {
        for (const key in config) {
            process.env[key] = config[key];
        }

        return {
            module: AppModule,
            imports: [
                TypeOrmModule.forRootAsync({
                    imports: [ConfigModule],
                    useFactory: (configApi: ConfigServiceApi) =>
                        ({
                            type:
                                configApi.DATABASE_TYPE === 'test'
                                    ? 'sqlite'
                                    : configApi.DATABASE_TYPE,
                            host: configApi.DATABASE_HOST,
                            port: configApi.DATABASE_PORT,
                            username: configApi.DATABASE_USERNAME,
                            password: configApi.DATABASE_PASSWORD,
                            database:
                                configApi.DATABASE_TYPE === 'test'
                                    ? ':memory:'
                                    : configApi.DATABASE_NAME,
                            entities: [DbSession, User],
                            entityPrefix: 'simple_auth_',
                            synchronize: true
                        } as ConnectionOptions),
                    inject: [ConfigServiceApi]
                }),
                TypeOrmModule.forFeature([DbSession, User]),
                ConfigModule.forRoot({
                    cache: true,
                    validate: envValidate
                }),
                LoggerWinstonModule
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
                Mail,
                Password,
                Token,
                ConfigServiceApi
            ]
        };
    }
}
