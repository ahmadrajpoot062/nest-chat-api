import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { disconnect, Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

describe('Auth E2E', () => {
    let app: INestApplication;
    let connection: Connection;
    // Use timestamp in username to avoid collisions between test runs
    const testUser = {
        username: `auth_test_user_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        password: 'pass123',
    };

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
        
        connection = moduleRef.get<Connection>(getConnectionToken());
        
        // Clean up any test users that might be left from previous test runs
        await connection.collection('users').deleteMany({
            username: { $regex: /^auth_test_user_/ }
        });
    });

    afterAll(async () => {
        // Clean up test user
        await connection.collection('users').deleteMany({ 
            username: { $regex: /^auth_test_user_/ } 
        });
        await app.close();
        await disconnect();
    });

    it('should register a new user', async () => {
        const res = await request(app.getHttpServer())
            .post('/auth/register')
            .send(testUser)
            .expect(201);

        expect(res.body).toHaveProperty('message', 'User registered');
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
        expect(typeof res.body.access_token).toBe('string');
        expect(res.body).toHaveProperty('user');
        expect(res.body.user).toHaveProperty('username', testUser.username);
    });
    
    it('should fail with invalid credentials', async () => {
        await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                username: testUser.username,
                password: 'wrongPassword123',
            })
            .expect(401);
    });
});