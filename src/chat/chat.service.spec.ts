import { ChatService } from './chat.service';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { ChatMessage } from './schemas/chat.schema';

/**
 * Test suite for ChatService class
 * Tests the service's functionality without actual database connections
 */
describe('ChatService', () => {
  let service: ChatService;

  /**
   * Mock implementation of the ChatMessage model
   * Returns a mock object with save method that resolves to a complete message object
   * This allows us to test the service without connecting to MongoDB
   */
  const mockChatMessageConstructor = jest.fn().mockImplementation((dto) => ({
    ...dto,
    save: jest.fn().mockResolvedValue({
      _id: 'some_id',
      sender: dto.sender,
      content: dto.content,
      room: dto.room,
      createdAt: new Date(),
    }),
  }));

  /**
   * Set up the testing module before each test
   * Creates a fresh instance of the service with mock dependencies
   */
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          // Provide a mock implementation instead of the real MongoDB model
          provide: getModelToken(ChatMessage.name),
          useValue: mockChatMessageConstructor,
        },
      ],
    }).compile();

    // Get the service instance to test
    service = module.get<ChatService>(ChatService);
  });

  /**
   * Test case: Verify that the service can create a new chat message
   * Checks that the returned message has the expected properties
   */
  it('should create a chat message', async () => {
    const message = await service.createMessage('user123', 'Hello', 'room1');
    expect(message).toHaveProperty('sender', 'user123');
    expect(message).toHaveProperty('content', 'Hello');
    expect(message).toHaveProperty('room', 'room1');
  });
});
