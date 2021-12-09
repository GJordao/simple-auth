import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
// Controllers
import { AccountController } from './controllers/AccountController';
import { LoginController } from './controllers/LoginController';
import { LogoutController } from './controllers/LogoutController';
import { RefreshController } from './controllers/RefreshController';
import { PasswordController } from "./controllers/PasswordController";
import { RegisterController } from './controllers/RegisterController';
import { ValidatorController } from "./controllers/ValidatorController";
// Services
import { AuthValidator } from './services/AuthValidator';
import { Blocklist } from "./services/Blocklist";
import { Environment } from "./services/Environment";
import { Logger } from "./services/Logger";
import { Mail } from "./services/Mail";
import { Password } from "./services/Password";
import { Token } from "./services/Token";
// Entities
import { DbSession } from "./entities/DbSession";
import { User } from "./entities/User";

@Module({
    imports: [
        ConfigModule.forRoot(),
        /**
         * We can use process.env here
         * The module Environment will throw an error 
         * When initalised if any env vars are missing
         */
        TypeOrmModule.forRoot({
            type: process.env.DATABASE_TYPE as any,
            host: process.env.DATABASE_HOST,
            port: Number(process.env.DATABASE_PORT),
            username: process.env.DATABASE_USERNAME,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
            entities: [DbSession, User],
            entityPrefix: "simple_auth_",
            synchronize: true,
        }),
        TypeOrmModule.forFeature([DbSession, User])
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
        AuthValidator,
        Blocklist,
        Environment,
        Logger,
        Mail,
        Password,
        Token,
    ],
    exports: [
        AuthValidator,
    ]
})
export class AppModule {}
