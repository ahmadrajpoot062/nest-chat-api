import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatMessage, ChatMessageSchema } from './schemas/chat.schema';
import { ChatGateway } from './gateway/chat.gateway';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module'; // Import UsersModule to access UsersService

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatMessage.name, schema: ChatMessageSchema },
    ]),
    UsersModule,
    JwtModule.register({
      secret: 'ThisIsMySuperSecretKey123!@#', // must match AuthModule
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
})
export class ChatModule {}
