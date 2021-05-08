import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EnvironmentVariables } from 'src/configs/EnvValidation';
import { AppModule } from '../AppModule';

export class AppMemoryDb {
    app: INestApplication;

    async setup(config: EnvironmentVariables) {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule.register(config)]
        }).compile();

        this.app = moduleFixture.createNestApplication();
        await this.app.init();
    }

    async teardown() {
        await this.app.close();
    }
}
