// Packages
import { AppModule } from './AppModule';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from './configs/ValidationPipe';
import { EnvironmentVariables } from './configs/EnvValidation';

async function bootstrap() {
    const app = await NestFactory.create(
        AppModule.register({} as EnvironmentVariables)
    );
    app.useGlobalPipes(new ValidationPipe());
    const configService = app.get('ConfigService');
    const loggerInstance = app.get('ConsoleLogger');

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

    loggerInstance.debug(
        `Started server on port: ${configService.get('PORT')}`
    );
    await app.listen(configService.get('PORT'));
}

bootstrap();
