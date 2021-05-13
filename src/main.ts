// Packages
import { AppModule } from './AppModule';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from './configs/ValidationPipe';
import { EnvironmentVariables } from './configs/EnvValidation';
import { LoggerWinstonService } from './logger/LoggerWinstonService';

async function bootstrap() {
    const app = await NestFactory.create(
        AppModule.register({} as EnvironmentVariables),
        { logger: false }
    );
    app.useLogger(app.get(LoggerWinstonService));
    app.useGlobalPipes(new ValidationPipe());
    const configService = app.get('ConfigService');
    const logger = await app.get('LoggerWinstonService').asyncSetup();

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

    logger.debug(
        `Started server on port: ${configService.get('PORT')}`,
        'Bootstrap'
    );
    await app.listen(configService.get('PORT'));
}

bootstrap();
