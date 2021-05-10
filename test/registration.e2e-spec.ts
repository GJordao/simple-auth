import { JWT_PATTERN } from '../src/testing';
import { User } from 'src/testing/TOs';
import { EnvironmentVariables } from '../src/configs/EnvValidation';
import { RegistrationTestApp } from '../src/testing/RegistrationTestApp';

describe('Registration (e2e)', () => {
    const testApp = new RegistrationTestApp();

    beforeEach(async () => {
        await testApp.setup({
            DATABASE_TYPE: 'test',
            TOKEN_ENCRYPTION_KEY: 'some-key'
        } as EnvironmentVariables);
    });

    afterEach(async () => {
        await testApp.teardown();
    });

    it('registers a new user successfully', async () => {
        const jack: User = { email: 'jack@mail.com', password: '' };
        const {
            status,
            body: { email }
        } = await testApp.registerUser(jack);
        expect(status).toBe(201);
        expect(email).toBe(jack.email);
    });

    it('fails to register the same user twice', async () => {
        const jack: User = { email: 'jack@mail.com', password: 'qwe' };

        const { status } = await testApp.registerUser(jack);
        expect(status).toBe(201);

        const { status: statusRepeat } = await testApp.registerUser(jack);
        expect(statusRepeat).toBe(400);
    });

    it('logs in successfully an already registered user', async () => {
        const jack: User = { email: 'jack@mail.com', password: 'qwe' };

        const { status } = await testApp.registerUser(jack);
        expect(status).toBe(201);

        const {
            status: loginStatus,
            body: {
                bearer: { token: bearerToken },
                refresh: { token: refreshToken }
            }
        } = await testApp.loginUser(jack);
        expect(loginStatus).toBe(201);

        expect(bearerToken).toMatch(JWT_PATTERN);
        expect(refreshToken).toMatch(JWT_PATTERN);
    });

    it('fails to login with an already registered user, providing wrong credentials', async () => {
        const jack: User = { email: 'jack@mail.com', password: 'qwe' };
        const fakeJack = { ...jack, password: 'asd' };

        const { status } = await testApp.registerUser(jack);
        expect(status).toBe(201);

        const { status: loginStatus } = await testApp.loginUser(fakeJack);

        expect(loginStatus).toBe(400);
    });

    it.skip('obtains a new Bearer token given a valid refresh token', async () => {
        const jack: User = { email: 'jack@mail.com', password: 'qwe' };

        const { status } = await testApp.registerUser(jack);
        expect(status).toBe(201);

        const {
            status: loginStatus,
            body: {
                bearer: { token: bearerToken },
                refresh: { token: refreshToken }
            }
        } = await testApp.loginUser(jack);
        expect(loginStatus).toBe(201);

        const {
            status: refreshStatus,
            body: {
                bearer: { token: newBearerToken }
            }
        } = await testApp.refreshBearerToken(bearerToken, refreshToken);
        expect(refreshStatus).toBe(201);
        expect(bearerToken).not.toEqual(newBearerToken);
    });
});
