import * as request from 'supertest';
import { BaseTestApp } from '.';
import { User } from './TOs';

export class RegistrationTestApp extends BaseTestApp {
    async registerUser(user: User) {
        return await request(this.app.getHttpServer())
            .post('/auth/register')
            .send(user);
    }

    async loginUser(user: User) {
        return await request(this.app.getHttpServer())
            .post('/auth/login')
            .send(user);
    }

    async refreshBearerToken(bearerToken: string, refreshToken: string) {
        return await request(this.app.getHttpServer())
            .post('/auth/refresh')
            .send({ refreshToken })
            .set('authorization', 'Bearer ' + bearerToken);
    }
}
