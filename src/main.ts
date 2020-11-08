import { NestFactory } from "@nestjs/core";
import { AppModule } from "./AppModule";
import { ValidationPipe } from "./configs/ValidationPipe";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());
    const environmentInstance = app.get("Environment");
    const loggerInstance = app.get("ConsoleLogger");

    loggerInstance.debug(`Started server on port: ${environmentInstance.PORT}`);
    await app.listen(environmentInstance.PORT);
}

bootstrap();
