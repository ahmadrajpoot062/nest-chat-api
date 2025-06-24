import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CreateMessageDto } from './dto/create-message.dto';

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('chat')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('send')
  async sendMessage(
    @Body() dto: CreateMessageDto,
    @Request() req: any,
  ) {
    const sender = req.user.username;
    const avatar = req.user.avatar; // ✅ get from JWT payload
    return this.chatService.createMessage(sender, dto.content, dto.room, dto?.file, avatar);
  }

  @Get(':room')
  async getMessages(@Param('room') room: string) {
    return this.chatService.getRecentMessages(room);
  }
}
