import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from '../chat.service';
import { UsersService } from '../../users/users.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private roomUsers = new Map<string, Set<string>>();

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) { }

  async handleConnection(socket: Socket) {
    const token = socket.handshake.auth?.token || socket.handshake.query.token;

    try {
      const payload = this.jwtService.verify(token as string);
      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        socket.disconnect();
        return;
      }

      socket.data.userId = user._id || user.id;
      socket.data.username = user.username;
      socket.data.avatar = user.avatar || '';

      console.log(`✅ ${user.username} connected`);
    } catch {
      socket.disconnect();
    }
  }

  @SubscribeMessage('join')
  async handleJoin(
    @MessageBody() data: { room: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const { username } = socket.data;
    const { room } = data;

    socket.join(room);

    if (!this.roomUsers.has(room)) {
      this.roomUsers.set(room, new Set());
    }

    this.roomUsers.get(room)!.add(username);

    const usersInRoom = Array.from(this.roomUsers.get(room)!);
    this.server.to(room).emit('users', usersInRoom);

    console.log(`👤 ${username} joined room: ${room}`);
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() data: { room: string; content: string; file?: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const { username, avatar } = socket.data;
    const { room, content, file } = data;

    if (!room || !content) return;

    try {
      const savedMessage = await this.chatService.createMessage(
        username,
        content,
        room,
        file,
      );

      const payload = {
        _id: String(savedMessage._id), // Or: (savedMessage._id as Types.ObjectId).toString()
        sender: savedMessage.sender,
        content: savedMessage.content,
        file: savedMessage.file || null,
        room: savedMessage.room,
        seen: false,
        avatar: avatar || '',
        createdAt: savedMessage.createdAt?.toISOString() || new Date().toISOString(),
      };


      this.server.to(room).emit('message', payload);
    } catch (err) {
      console.error('❌ Message error:', err.message);
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { room: string; typing: boolean },
    @ConnectedSocket() socket: Socket,
  ) {
    const { username } = socket.data;
    socket.to(data.room).emit('typing', { user: username, typing: data.typing });
  }

  @SubscribeMessage('seen')
  handleSeen(
    @MessageBody() data: { room: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const { username } = socket.data;
    this.server.to(data.room).emit('seen', { by: username });
  }

  handleDisconnect(socket: Socket) {
    const { username } = socket.data;

    for (const [room, users] of this.roomUsers.entries()) {
      if (users.has(username)) {
        users.delete(username);
        this.server.to(room).emit('users', Array.from(users));
      }
    }

    console.log(`❌ ${username} disconnected`);
  }
}
