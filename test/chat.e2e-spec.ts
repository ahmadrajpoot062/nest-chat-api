// test/chat.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('ChatController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Register a test user
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        username: 'test-chat-e2e',
        password: 'pass1234',
      });

    // Login to get JWT token
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'test-chat-e2e',
        password: 'pass1234',
      });

    accessToken = loginRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /chat/send - should send a message', async () => {
    const res = await request(app.getHttpServer())
      .post('/chat/send')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        room: 'general',
        content: 'Hello from E2E test',
      })
      .expect(201);

    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('room', 'general');
    expect(res.body).toHaveProperty('content', 'Hello from E2E test');
    expect(res.body).toHaveProperty('sender', 'test-chat-e2e');
  });

  it('GET /chat/general - should get messages from the room', async () => {
    const res = await request(app.getHttpServer())
      .get('/chat/general')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('content');
    expect(res.body[0]).toHaveProperty('sender');
  });
});
