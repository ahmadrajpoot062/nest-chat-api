import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserDoc = {
    _id: 'user-id',
    username: 'test',
    password: 'hashedpw',
    save: jest.fn().mockResolvedValue(this),
  };

  const mockUserModel = {
    findOne: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockUserDoc),
    }),
    findById: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockUserDoc),
    }),
    prototype: {
      save: jest.fn().mockResolvedValue(mockUserDoc),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a user by username', async () => {
    const user = await service.findByUsername('test');
    expect(user).toBeDefined();
    expect(user?.username).toEqual('test');
  });

  it('should return a user by id', async () => {
    const user = await service.findById('user-id');
    expect(user).toBeDefined();
    expect(user?._id).toEqual('user-id');
  });
});
