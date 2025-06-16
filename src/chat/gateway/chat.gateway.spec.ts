import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { ChatService } from '../chat.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { Socket } from 'socket.io';

describe('ChatGateway', () => {
  let gateway: ChatGateway;

  const mockUser = {
    _id: 'user-id',
    username: 'test-user',
  };

  const mockChatService = {
    createMessage: jest.fn().mockResolvedValue({
      content: 'hello',
      sender: 'test-user',
      room: 'general',
    }),
  };

  const mockJwtService = {
    verify: jest.fn().mockReturnValue({ sub: 'user-id', username: 'test-user' }),
  };

  const mockUsersService = {
    findById: jest.fn().mockResolvedValue(mockUser),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        { provide: ChatService, useValue: mockChatService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should handle connection and store user info in socket', async () => {
    const socket = {
      handshake: { query: { token: 'mock-token' } },
      data: {},
      disconnect: jest.fn(),
    } as unknown as Socket;

    await gateway.handleConnection(socket);

    expect(socket.data.userId).toBe(mockUser._id);
    expect(socket.data.username).toBe(mockUser.username);
  });

  it('should handle join message', () => {
    const socket = {
      join: jest.fn(),
      data: { username: 'test-user' },
    } as any;

    gateway.handleJoin({ room: 'general' }, socket);

    expect(socket.join).toHaveBeenCalledWith('general');
  });

  it('should handle message and broadcast', async () => {
    const mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    const socket = {
      data: { username: 'test-user' },
    } as any;

    gateway.server = mockServer as any;

    await gateway.handleMessage({ room: 'general', content: 'hello' }, socket);

    expect(mockServer.emit).toHaveBeenCalledWith('message', {
      content: 'hello',
      sender: 'test-user',
      room: 'general',
    });
  });
});
