import { INestApplication } from '@nestjs/common';
import { EnvironmentVariables } from '../Config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../AppModule';

export * from './constants';

export class BaseTestApp {
    public app: INestApplication;

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
