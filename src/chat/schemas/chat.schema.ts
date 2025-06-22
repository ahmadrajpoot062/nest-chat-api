import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ChatMessage extends Document {
  @Prop({ required: true })
  sender: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  room: string;

  @Prop()
  file?: string; // Optional file or emoji image

  @Prop({ default: false })
  seen: boolean; // Seen status

  @Prop()
  avatar?: string; // Optional avatar of sender

  @Prop()
  createdAt: Date;
}

export type ChatMessageDocument = ChatMessage & Document;

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
