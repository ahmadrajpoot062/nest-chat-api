import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { disconnect } from 'mongoose';

describe('Auth E2E', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
        await disconnect(); // Close Mongoose connection
    });

    const testUser = {
        username: `e2e_user_${Date.now()}`, // ← Unique every run
        password: 'pass123',
    };

    it('should register a new user', async () => {
        const res = await request(app.getHttpServer())
            .post('/auth/register')
            .send(testUser)
            .expect(201);

        expect(res.body).toHaveProperty('message', 'User registered successfully');
        expect(res.body).toHaveProperty('user');
        expect(res.body.user).toHaveProperty('_id');
        expect(res.body.user).toHaveProperty('username', testUser.username);
    });

    it('should login the user and return JWT token', async () => {
        const res = await request(app.getHttpServer())
            .post('/auth/login')
            .send(testUser)
            .expect(201);

        expect(res.body).toHaveProperty('access_token');
    });
});