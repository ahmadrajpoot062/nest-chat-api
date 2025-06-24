// test/chat.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { disconnect, Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

describe('ChatController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let connection: Connection;
  
  // Create a unique test user for this chat test
  const testUser = {
    username: `chat_test_user_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
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
    
    // Clean up any existing test users and messages
    await connection.collection('users').deleteMany({
      username: { $regex: /^chat_test_user_/ }
    });
    await connection.collection('chatmessages').deleteMany({
      sender: { $regex: /^chat_test_user_/ }
    });

    // Register a test user
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser);

    // Login to get JWT token
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send(testUser);

    accessToken = loginRes.body.access_token;
  });

  afterAll(async () => {
    // Clean up test data
    await connection.collection('users').deleteMany({
      username: { $regex: /^chat_test_user_/ }
    });
    await connection.collection('chatmessages').deleteMany({
      sender: { $regex: /^chat_test_user_/ }
    });
    
    await app.close();
    await disconnect();
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
    expect(res.body).toHaveProperty('sender', testUser.username);
  });

  it('POST /chat/send - should send a message with file', async () => {
    const res = await request(app.getHttpServer())
      .post('/chat/send')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        room: 'general',
        content: 'Hello with file',
        file: 'test-file-data.jpg', // Simulating a file reference
      })
      .expect(201);

    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('file', 'test-file-data.jpg');
  });

  it('GET /chat/general - should get messages from the room', async () => {
    // First, ensure there's at least one message
    await request(app.getHttpServer())
      .post('/chat/send')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        room: 'general',
        content: 'Another test message',
      });
      
    const res = await request(app.getHttpServer())
      .get('/chat/general')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('content');
    expect(res.body[0]).toHaveProperty('sender');
  });
  
  it('GET /chat/nonexistent - should return empty array for room with no messages', async () => {
    const res = await request(app.getHttpServer())
      .get('/chat/nonexistent')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });
  
  it('should reject unauthorized requests', async () => {
    await request(app.getHttpServer())
      .get('/chat/general')
      .expect(401);
      
    await request(app.getHttpServer())
      .post('/chat/send')
      .send({
        room: 'general',
        content: 'Unauthorized message',
      })
      .expect(401);
  });
});
