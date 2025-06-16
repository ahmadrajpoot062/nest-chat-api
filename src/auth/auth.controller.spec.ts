import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUser = { id: 'user1', username: 'john' };

  const mockAuthService = {
    register: jest.fn().mockResolvedValue(mockUser),
    validateUser: jest.fn(),
    login: jest.fn().mockResolvedValue({ access_token: 'token123' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register a user', async () => {
    const dto = { username: 'john', password: '123456' };
    const result = await controller.register(dto);

    expect(result).toEqual({
      message: 'User registered successfully',
      user: mockUser,
    });
    expect(authService.register).toHaveBeenCalledWith('john', '123456');
  });

  it('should login a user with valid credentials', async () => {
    const dto = { username: 'john', password: '123456' };

    mockAuthService.validateUser.mockResolvedValue(mockUser);

    const result = await controller.login(dto);

    expect(result).toHaveProperty('access_token', 'token123');
    expect(authService.validateUser).toHaveBeenCalledWith('john', '123456');
    expect(authService.login).toHaveBeenCalledWith(mockUser);
  });

  it('should throw UnauthorizedException for invalid credentials', async () => {
    const dto = { username: 'wrong', password: 'invalid' };

    mockAuthService.validateUser.mockResolvedValue(null);

    await expect(controller.login(dto)).rejects.toThrow(UnauthorizedException);
  });
});
