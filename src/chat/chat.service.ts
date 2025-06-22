import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatMessage, ChatMessageDocument } from './schemas/chat.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatMessage.name)
    private chatModel: Model<ChatMessageDocument>,
  ) { }

  async createMessage(
    sender: string,
    content: string,
    room: string,
    file?: string,
  ): Promise<ChatMessageDocument> {
    const msg = new this.chatModel({ sender, content, room, file });
    return msg.save(); // ✅ Returns full document
  }

  async getRecentMessages(room: string) {
    return this.chatModel
      .find({ room })
      .sort({ createdAt: 1 })
      .limit(100)
      .exec();
  }
}
