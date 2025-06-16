// src/app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatModule } from './chat/chat.module';
import { ChatMessage, ChatMessageSchema } from './chat/schemas/chat.schema';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller'; // ✅ Add this
import { AppService } from './app.service';       // ✅ And this

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/nest-chat'),
    MongooseModule.forFeature([
      { name: ChatMessage.name, schema: ChatMessageSchema },
    ]),
    ChatModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController], // ✅ Register AppController
   providers: [AppService],      // ✅ Register AppService
})
export class AppModule {}
