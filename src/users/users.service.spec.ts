import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { ConflictException } from '@nestjs/common';
import { MongoServerError } from 'mongodb';

describe('UsersService', () => {
  let service: UsersService;

  // Use a more sophisticated mock to properly track what's being passed to the constructor
  const mockUserModel = function(userData) {
    this.username = userData.username;
    this.password = userData.password;
    this.avatar = userData.avatar;

    this.save = jest.fn(async function() {
      // Check username to simulate different responses
      if (this.username === 'existinguser') {
        const error = new MongoServerError({ 
          keyValue: { username: 'existinguser' },
          code: 11000,
        });
        return Promise.reject(error);
      }
      
      if (this.username === 'erroruser') {
        return Promise.reject(new Error('Some unknown error'));
      }
      
      return Promise.resolve({
        _id: 'new-user-id',
        username: this.username,
        password: this.password,
        avatar: this.avatar,
      });
    });
    
    return this;
  };
  
  // Add static methods to the model
  mockUserModel.findOne = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue({
      _id: 'user-id',
      username: 'testuser',
      password: 'hashedpassword',
      avatar: 'avatar.jpg',
      toObject: jest.fn().mockReturnValue({
        _id: 'user-id',
        username: 'testuser',
        password: 'hashedpassword',
        avatar: 'avatar.jpg',
      }),
    }),
  });
  
  mockUserModel.findById = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue({
      _id: 'user-id',
      username: 'testuser',
      password: 'hashedpassword',
      avatar: 'avatar.jpg',
      toObject: jest.fn().mockReturnValue({
        _id: 'user-id',
        username: 'testuser',
        password: 'hashedpassword',
        avatar: 'avatar.jpg',
      }),
    }),
  });

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

  describe('create', () => {
    it('should successfully create a new user', async () => {
      const result = await service.create('newuser', 'hashedpass', 'avatar.jpg');
      
      // Verify the result has all expected properties
      expect(result).toEqual({
        _id: 'new-user-id',
        username: 'newuser',
        password: 'hashedpass',
        avatar: 'avatar.jpg',
      });
    });

    it('should throw ConflictException when username already exists', async () => {
      // The test will fail if ConflictException is not thrown
      await expect(
        service.create('existinguser', 'hashedpass')
      ).rejects.toThrow(ConflictException);
    });

    it('should rethrow unknown errors', async () => {
      // The test will fail if the specific error is not thrown
      await expect(
        service.create('erroruser', 'hashedpass')
      ).rejects.toThrow('Some unknown error');
    });
  });

  describe('findByUsername', () => {
    it('should find a user by username', async () => {
      const result = await service.findByUsername('testuser');
      
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(result).toHaveProperty('_id', 'user-id');
      expect(result).toHaveProperty('username', 'testuser');
    });

    it('should return null when user is not found', async () => {
      // Override the default mock for this test
      mockUserModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });
      
      const result = await service.findByUsername('nonexistent');
      
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ username: 'nonexistent' });
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      const result = await service.findById('user-id');
      
      expect(mockUserModel.findById).toHaveBeenCalledWith('user-id');
      expect(result).toHaveProperty('_id', 'user-id');
    });

    it('should return null when user id is not found', async () => {
      // Override the default mock for this test
      mockUserModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });
      
      const result = await service.findById('nonexistent-id');
      
      expect(mockUserModel.findById).toHaveBeenCalledWith('nonexistent-id');
      expect(result).toBeNull();
    });
  });
});

