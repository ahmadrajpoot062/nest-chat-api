import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';

describe('ChatController', () => {
  let controller: ChatController;
  let chatService: ChatService;

  const mockChatService = {
    createMessage: jest.fn().mockResolvedValue({
      _id: 'mockId',
      sender: 'john_doe',
      content: 'Hello there',
      room: 'room1',
      createdAt: new Date(),
    }),
    getRecentMessages: jest.fn().mockResolvedValue([
      {
        _id: 'msg1',
        sender: 'john_doe',
        content: 'Hi',
        room: 'room1',
        createdAt: new Date(),
      },
    ]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        {
          provide: ChatService,
          useValue: mockChatService,
        },
      ],
    }).compile();

    controller = module.get<ChatController>(ChatController);
    chatService = module.get<ChatService>(ChatService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should send a message', async () => {
    const dto: CreateMessageDto = {
      room: 'room1',
      content: 'Hello there',
    };

    const req = {
      user: {
        username: 'john_doe',
      },
    };

    const result = await controller.sendMessage(dto, req);
    expect(result).toHaveProperty('sender', 'john_doe');
    expect(result).toHaveProperty('content', 'Hello there');
    expect(chatService.createMessage).toHaveBeenCalledWith('john_doe', 'Hello there', 'room1');
  });

  it('should return messages for a room', async () => {
    const result = await controller.getMessages('room1');
    expect(Array.isArray(result)).toBe(true);
    expect(chatService.getRecentMessages).toHaveBeenCalledWith('room1');
  });
});
