// import { Test, TestingModule } from '@nestjs/testing';
// import { INestApplication } from '@nestjs/common';
import { loginUser, registerUser, refreshBearerToken } from '../src/testing';
import * as request from 'supertest';
import { AppMemoryDb } from '../src/testing/AppMemSetup';
import { User } from 'src/testing/TOs';
import { EnvironmentVariables } from 'src/configs/EnvValidation';

describe('Registration (e2e)', () => {
    const appMem = new AppMemoryDb();

    beforeEach(async () => {
        await appMem.setup({
            DATABASE_TYPE: 'sqlite',
            DATABASE_NAME: ':memory:',
            DATABASE_HOST: 'localhost',
            DATABASE_PORT: '5432',
            DATABASE_USERNAME: 'jack',
            DATABASE_PASSWORD: 'jack-password',
            TOKEN_ENCRYPTION_KEY: 'some-key'
        } as EnvironmentVariables);
    });

    afterEach(async () => {
        await appMem.teardown();
    });

    it('registers a new user successfully', async () => {
        const jack: User = { email: 'jack@mail.com', password: '' };
        const {
            status,
            body: { email }
        } = await request(appMem.app.getHttpServer())
            .post('/auth/register')
            .send(jack);
        expect(status).toBe(201);
        expect(email).toBe(jack.email);
    });

    it('fails to register the same user twice', async () => {
        const jack: User = { email: 'jack@mail.com', password: 'qwe' };

        const { status } = await registerUser(appMem.app, jack);
        expect(status).toBe(201);

        const { status: statusRepeat } = await registerUser(appMem.app, jack);
        expect(statusRepeat).toBe(400);
    });

    it('logs in successfully an already registered user', async () => {
        const jack: User = { email: 'jack@mail.com', password: 'qwe' };

        const { status } = await registerUser(appMem.app, jack);
        expect(status).toBe(201);

        const {
            status: loginStatus,
            body: {
                bearer: { token: bearerToken },
                refresh: { token: refreshToken }
            }
        } = await loginUser(appMem.app, jack);
        expect(loginStatus).toBe(201);
        expect(bearerToken).toMatch(/.*..*..*/);
        expect(refreshToken).toMatch(/.*..*..*/);
    });

    it('fails to login with an already registered user, providing wrong credentials', async () => {
        const jack: User = { email: 'jack@mail.com', password: 'qwe' };
        const fakeJack = { ...jack, password: 'asd' };

        const { status } = await registerUser(appMem.app, jack);
        expect(status).toBe(201);

        const { status: loginStatus, body } = await loginUser(
            appMem.app,
            fakeJack
        );

        expect(loginStatus).toBe(400);
    });

    it('obtains a new Bearer token given a valid refresh token', async () => {
        const jack: User = { email: 'jack@mail.com', password: 'qwe' };

        const { status } = await registerUser(appMem.app, jack);
        expect(status).toBe(201);

        const {
            status: loginStatus,
            body: {
                bearer: { token: bearerToken },
                refresh: { token: refreshToken }
            }
        } = await loginUser(appMem.app, jack);
        expect(loginStatus).toBe(201);

        const {
            status: refreshStatus,
            body: {
                bearer: { token: newBearerToken }
            }
        } = await refreshBearerToken(appMem.app, bearerToken, refreshToken);
        expect(refreshStatus).toBe(201);
        // expect(newBearerToken).not.toEqual(bearerToken);
        expect(bearerToken).not.toEqual(newBearerToken);

        // expect(refres).toMatch(/.*..*..*/);
    });
});
