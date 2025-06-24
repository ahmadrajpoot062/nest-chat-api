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
    avatar: 'avatar.jpg'
  };

  const mockChatService = {
    createMessage: jest.fn().mockResolvedValue({
      _id: 'msg-id',
      content: 'hello',
      sender: 'test-user',
      room: 'general',
      file: null,
      avatar: 'avatar.jpg',
      createdAt: new Date(),
    }),
  };

  const mockJwtService = {
    verify: jest.fn().mockReturnValue({ 
      sub: 'user-id', 
      username: 'test-user',
      avatar: 'avatar.jpg'
    }),
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
    
    // Initialize the server property to avoid 'undefined' errors
    gateway.server = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    } as any;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should handle connection and store user info in socket', async () => {
    const socket = {
      handshake: { 
        auth: { token: 'mock-token' }
      },
      data: {},
      disconnect: jest.fn(),
    } as unknown as Socket;

    await gateway.handleConnection(socket);

    expect(socket.data.userId).toBe(mockUser._id);
    expect(socket.data.username).toBe(mockUser.username);
    expect(socket.data.avatar).toBe(mockUser.avatar);
  });

  it('should handle connection with query token', async () => {
    const socket = {
      handshake: { 
        auth: {},
        query: { token: 'mock-token' }
      },
      data: {},
      disconnect: jest.fn(),
    } as unknown as Socket;

    await gateway.handleConnection(socket);

    expect(socket.data.userId).toBe(mockUser._id);
    expect(socket.data.username).toBe(mockUser.username);
  });

  it('should handle join message and track room users', () => {
    const socket = {
      join: jest.fn(),
      data: { 
        username: 'test-user',
        userId: 'user-id'
      },
    } as any;
    
    // We already initialized server in beforeEach
    gateway.handleJoin({ room: 'general' }, socket);

    expect(socket.join).toHaveBeenCalledWith('general');
    expect(gateway.server.to).toHaveBeenCalledWith('general');
    expect(gateway.server.emit).toHaveBeenCalled();
  });

  it('should handle message and broadcast with all fields', async () => {
    const mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    const socket = {
      data: { 
        username: 'test-user',
        avatar: 'avatar.jpg'
      },
    } as any;

    gateway.server = mockServer as any;

    await gateway.handleMessage({ 
      room: 'general', 
      content: 'hello',
      file: 'file.jpg'
    }, socket);

    expect(mockChatService.createMessage).toHaveBeenCalledWith(
      'test-user',
      'hello',
      'general',
      'file.jpg',
      'avatar.jpg'
    );
    
    expect(mockServer.to).toHaveBeenCalledWith('general');
    expect(mockServer.emit).toHaveBeenCalledWith('message', expect.objectContaining({
      sender: 'test-user',
      content: 'hello',
      room: 'general',
      avatar: 'avatar.jpg'
    }));
  });

  it('should handle typing event', () => {
    const socket = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
      data: { username: 'test-user' },
    } as any;

    gateway.handleTyping({ room: 'general', typing: true }, socket);

    expect(socket.to).toHaveBeenCalledWith('general');
    expect(socket.emit).toHaveBeenCalledWith('typing', { 
      user: 'test-user', 
      typing: true 
    });
  });

  it('should handle seen event', () => {
    const mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    const socket = {
      data: { username: 'test-user' },
    } as any;

    gateway.server = mockServer as any;

    gateway.handleSeen({ room: 'general' }, socket);

    expect(mockServer.to).toHaveBeenCalledWith('general');
    expect(mockServer.emit).toHaveBeenCalledWith('seen', { by: 'test-user' });
  });

  it('should handle disconnection and remove user from rooms', () => {
    const mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    const socket = {
      data: { username: 'test-user' },
    } as any;

    gateway.server = mockServer as any;
    
    // Setup mock rooms with this user
    const mockRooms = new Map();
    mockRooms.set('general', new Set(['test-user', 'other-user']));
    mockRooms.set('random', new Set(['other-user']));
    gateway['roomUsers'] = mockRooms;

    gateway.handleDisconnect(socket);

    // User should be removed from general, but random should be unchanged
    expect(mockServer.to).toHaveBeenCalledWith('general');
    expect(mockServer.emit).toHaveBeenCalledWith('users', ['other-user']);
    expect(mockRooms.get('general').has('test-user')).toBe(false);
    expect(mockRooms.get('random').has('other-user')).toBe(true);
  });
});
