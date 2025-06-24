import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUser = { _id: 'user1', username: 'john' };

  const mockAuthService = {
    register: jest.fn().mockImplementation((username, password, avatar) => {
      return Promise.resolve({ _id: 'user1', username, avatar: avatar || undefined });
    }),
    validateUser: jest.fn(),
    login: jest.fn().mockResolvedValue({ access_token: 'token123', user: mockUser }),
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

  it('should register a user (no avatar)', async () => {
    const dto = new RegisterDto();
    dto.username = 'john';
    dto.password = '123456';
    
    // Don't pass the file parameter at all instead of passing undefined
    const result = await controller.register(null as any, dto);

    expect(result).toEqual({
      message: 'User registered',
      user: expect.objectContaining({
        _id: 'user1',
        username: 'john',
      }),
    });
    expect(authService.register).toHaveBeenCalledWith('john', '123456', undefined);
  });

  it('should register a user (with avatar)', async () => {
    const dto = new RegisterDto();
    dto.username = 'john';
    dto.password = '123456';
    
    const mockFile = {
      filename: 'avatar.jpg'
    } as Express.Multer.File;
    
    const result = await controller.register(mockFile, dto);

    expect(result).toEqual({
      message: 'User registered',
      user: expect.objectContaining({
        _id: 'user1',
        username: 'john',
        avatar: 'avatar.jpg',
      }),
    });
    expect(authService.register).toHaveBeenCalledWith('john', '123456', 'avatar.jpg');
  });

  it('should login a user with valid credentials', async () => {
    const dto = new LoginDto();
    dto.username = 'john';
    dto.password = '123456';

    mockAuthService.validateUser.mockResolvedValue(mockUser);

    const result = await controller.login(dto);

    expect(result).toHaveProperty('access_token', 'token123');
    expect(result).toHaveProperty('user', mockUser);
    expect(authService.validateUser).toHaveBeenCalledWith('john', '123456');
    expect(authService.login).toHaveBeenCalledWith(mockUser);
  });

  it('should throw UnauthorizedException for invalid credentials', async () => {
    const dto = new LoginDto();
    dto.username = 'wrong';
    dto.password = 'invalid';

    mockAuthService.validateUser.mockResolvedValue(null);

    await expect(controller.login(dto)).rejects.toThrow(UnauthorizedException);
  });
});
