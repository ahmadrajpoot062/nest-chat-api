import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatMessage } from './schemas/chat.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatMessage.name)
    private chatModel: Model<ChatMessage>,
  ) {}

  async createMessage(sender: string, content: string, room: string) {
    const created = new this.chatModel({ sender, content, room });
    return await created.save();
  }

  async getRecentMessages(room: string) {
    return this.chatModel
      .find({ room })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
  }
}
