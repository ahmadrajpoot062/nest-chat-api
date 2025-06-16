import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mocked-token'),
  };

  const mockUsersService = {
    findByUsername: jest.fn(),
    create: jest.fn(),
  };

  const mockUser: any = {
    _id: '123',
    username: 'test',
    password: '', // will be set in beforeEach
    toObject: function () {
      const { password, ...rest } = this;
      return rest;
    },
  };

  beforeEach(async () => {
    // Set hashed password
    mockUser.password = await bcrypt.hash('pass123', 10);

    mockUsersService.findByUsername.mockResolvedValue(mockUser);
    mockUsersService.create.mockResolvedValue(mockUser);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should validate user with correct credentials', async () => {
    const validatedUser = await service.validateUser('test', 'pass123');
    expect(validatedUser).toBeDefined();
    expect(validatedUser.username).toBe('test');
  });

  it('should return null with invalid password', async () => {
    const result = await service.validateUser('test', 'wrongpass');
    expect(result).toBeNull();
  });

  it('should return a token on login', async () => {
    const result = await service.login({ username: 'test', _id: '123' });
    expect(result.access_token).toBe('mocked-token');
  });

  it('should register a user', async () => {
    const created = await service.register('test', 'pass123');
    expect(created).toBeDefined();
    expect(created.username).toBe('test');
  });
});
