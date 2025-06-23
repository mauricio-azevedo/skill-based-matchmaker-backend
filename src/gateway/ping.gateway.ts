import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtWsGuard } from '@/auth/guards/jwt-ws.guard';
import { UseGuards } from '@nestjs/common';

@UseGuards(JwtWsGuard)
@WebSocketGateway({ cors: { origin: '*' } })
export class PingGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    // Se chegou aqui, o guard aprovou o token
    client.emit('auth_ok', { msg: 'WebSocket protegido passou.' });
  }
}
