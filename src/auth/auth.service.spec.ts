import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('test-token'),
  };

  const mockUsersService = {
    findByUsername: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user without avatar', async () => {
      const mockUser = {
        _id: 'user-id',
        username: 'testuser',
        password: 'hashedPassword',
      };

      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await service.register('testuser', 'password123');

      expect(mockUsersService.create).toHaveBeenCalledWith(
        'testuser',
        expect.any(String),
        undefined,
      );

      expect(result).toEqual(mockUser);
    });

    it('should register a new user with avatar', async () => {
      const mockUser = {
        _id: 'user-id',
        username: 'testuser',
        password: 'hashedPassword',
        avatar: 'avatar.jpg',
      };

      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await service.register('testuser', 'password123', 'avatar.jpg');

      expect(mockUsersService.create).toHaveBeenCalledWith(
        'testuser',
        expect.any(String),
        'avatar.jpg',
      );

      expect(result).toEqual(mockUser);
    });
  });

  describe('validateUser', () => {
    it('should return user object when credentials are valid', async () => {
      const mockUser = {
        _id: 'user-id',
        username: 'testuser',
        password: await bcrypt.hash('password123', 10),
        avatar: 'avatar.jpg',
        toObject: jest.fn().mockReturnValue({
          _id: 'user-id',
          username: 'testuser',
          avatar: 'avatar.jpg',
        }),
      };

      mockUsersService.findByUsername.mockResolvedValue(mockUser);

      const result = await service.validateUser('testuser', 'password123');

      expect(mockUsersService.findByUsername).toHaveBeenCalledWith('testuser');
      expect(result).toEqual({
        _id: 'user-id',
        username: 'testuser',
        avatar: 'avatar.jpg',
      });
    });

    it('should return null when user is not found', async () => {
      mockUsersService.findByUsername.mockResolvedValue(null);

      const result = await service.validateUser('nonexistentuser', 'password123');

      expect(mockUsersService.findByUsername).toHaveBeenCalledWith('nonexistentuser');
      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      const mockUser = {
        _id: 'user-id',
        username: 'testuser',
        password: await bcrypt.hash('password123', 10),
      };

      mockUsersService.findByUsername.mockResolvedValue(mockUser);

      const result = await service.validateUser('testuser', 'wrongpassword');

      expect(mockUsersService.findByUsername).toHaveBeenCalledWith('testuser');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should generate a token with user details including avatar', async () => {
      const mockUser = {
        _id: 'user-id',
        username: 'testuser',
        avatar: 'avatar.jpg',
      };

      const result = await service.login(mockUser);

      expect(jwtService.sign).toHaveBeenCalledWith({
        username: 'testuser',
        sub: 'user-id',
        avatar: 'avatar.jpg',
      });

      expect(result).toEqual({
        access_token: 'test-token',
        user: mockUser,
      });
    });

    it('should handle user without avatar', async () => {
      const mockUser = {
        _id: 'user-id',
        username: 'testuser',
      };

      const result = await service.login(mockUser);

      expect(jwtService.sign).toHaveBeenCalledWith({
        username: 'testuser',
        sub: 'user-id',
        avatar: undefined,
      });

      expect(result).toEqual({
        access_token: 'test-token',
        user: mockUser,
      });
    });
  });
});
