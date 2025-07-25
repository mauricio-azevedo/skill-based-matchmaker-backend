import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtWsGuard } from '@/auth/guards/jwt-ws.guard';
import { UseGuards } from '@nestjs/common';

@UseGuards(JwtWsGuard)
@WebSocketGateway({ cors: { origin: '*' } })
export class PingGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  async handleConnection(client: Socket) {
    // requisitar que front envie groupId no auth handshake
    const { groupId } = client.handshake.auth;
    if (groupId) await client.join(`group:${groupId}`);

    // Se chegou aqui, o guard aprovou o token
    client.emit('auth_ok', { msg: 'WebSocket protegido passou.' });
  }
}
