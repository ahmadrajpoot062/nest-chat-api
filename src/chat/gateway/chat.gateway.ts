import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
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
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async handleConnection(socket: Socket) {
    const token = socket.handshake.query.token as string;

    try {
      const payload = this.jwtService.verify(token); // payload: { sub, username }
      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        console.error('❌ User not found for token payload:', payload);
        socket.disconnect();
        return;
      }

      socket.data.userId = user.id || user._id; // Ensure compatibility with both Mongoose and TypeORM
      socket.data.username = user.username;

      console.log(`✅ Connected: ${user.username}`);
    } catch (err) {
      console.error('❌ Invalid token in socket:', err.message);
      socket.disconnect();
    }
  }

  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() data: { room: string },
    @ConnectedSocket() socket: Socket,
  ) {
    socket.join(data.room);
    const username = socket.data.username;
    console.log(`👤 User "${username}" joined room "${data.room}"`);
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() data: { room: string; content: string },
    @ConnectedSocket() socket: Socket,
  ) {
    console.log('🟡 Received message payload:', data);

    const sender = socket.data.username;

    if (!data.content || !data.room) {
      console.error('❌ Invalid data received:', data);
      return;
    }

    const msg = await this.chatService.createMessage(sender, data.content, data.room);
    this.server.to(data.room).emit('message', msg);
  }
}
