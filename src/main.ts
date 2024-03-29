// Packages
import { AppModule } from "./AppModule";
import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from "./configs/ValidationPipe";
import { Environment } from './services/Environment';
import { ConsoleLogger } from './services/Logger/ConsoleLogger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());

    const environmentInstance = app.get(Environment);
    const loggerInstance = app.get(ConsoleLogger);
    const options = new DocumentBuilder()
        .setTitle('Simple-Auth')
        .setDescription('This document will describe the available endpoints this service')
        .setVersion('0.1.0')
        .addBearerAuth(
            { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
            'access-token',
        )
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('auth/explorer', app, document);

    loggerInstance.debug(`Started server on port: ${environmentInstance.PORT}`);
    await app.listen(environmentInstance.PORT);
}

bootstrap();
