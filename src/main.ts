// Packages
import { AppModule } from './AppModule';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from './configs/ValidationPipe';
import { LoggerWinstonService } from './logger/LoggerWinstonService';
import { EnvironmentVariables } from './Config';

async function bootstrap() {
    const app = await NestFactory.create(
        AppModule.register({} as EnvironmentVariables),
        { logger: false }
    );
    app.useLogger(app.get(LoggerWinstonService));
    app.useGlobalPipes(new ValidationPipe());
    const logger = await app.get('LoggerWinstonService').asyncSetup();
    const configApi = app.get('ConfigServiceApi');

    const options = new DocumentBuilder()
        .setTitle('Simple-Auth')
        .setDescription(
            'This document will describe the avilable endpoints this service'
        )
        .setVersion('0.1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('auth/explorer', app, document);

    logger.debug(`Started server on port: ${configApi.PORT}`, 'Bootstrap');
    await app.listen(configApi.PORT);
}

bootstrap();
