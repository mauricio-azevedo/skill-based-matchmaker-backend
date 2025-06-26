import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class RoundsGateway {
  @WebSocketServer() server: Server;

  emitRoundCreated(groupId: string, payload: unknown) {
    this.server.to(`group:${groupId}`).emit('round:created', payload);
  }

  emitScoreUpdated(groupId: string, payload: unknown) {
    this.server.to(`group:${groupId}`).emit('round:score', payload);
  }

  emitRoundDeleted(groupId: string, roundId: string) {
    this.server.to(`group:${groupId}`).emit('round:deleted', { roundId });
  }
}
