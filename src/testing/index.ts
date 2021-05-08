import { INestApplication } from '@nestjs/common';
import { User } from './TOs/User';
import * as request from 'supertest';

export async function registerUser(app: INestApplication, user: User) {
    return await request(app.getHttpServer()).post('/auth/register').send(user);
}

export async function loginUser(app: INestApplication, user: User) {
    return await request(app.getHttpServer()).post('/auth/login').send(user);
}

export async function refreshBearerToken(
    app: INestApplication,
    bearerToken: string,
    refreshToken: string
) {
    return await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .set('authorization', 'Bearer ' + bearerToken);
}
