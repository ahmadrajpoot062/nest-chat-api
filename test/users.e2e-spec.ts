import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { disconnect, Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  const testUser = {
    username: `testuser_${Date.now()}`, // unique username
    password: 'pass1234',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    connection = moduleFixture.get<Connection>(getConnectionToken());
  });

  afterAll(async () => {
    // Optional: Cleanup test user from DB
    await connection.collection('users').deleteMany({ username: testUser.username });
    await app.close();
    await disconnect();
  });

  it('POST /auth/register - should register a new user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201);

    expect(res.body).toHaveProperty('message', 'User registered successfully');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('_id');
    expect(res.body.user).toHaveProperty('username', testUser.username);
  });

  it('POST /auth/register - should fail for duplicate username', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(409); // ConflictException
  });

  it('POST /auth/login - should return JWT token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send(testUser)
      .expect(201);

    expect(res.body).toHaveProperty('access_token');
    expect(typeof res.body.access_token).toBe('string');
  });

  it('POST /auth/login - should fail with wrong password', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: testUser.username,
        password: 'wrongpass',
      })
      .expect(401); // Unauthorized
  });
});
