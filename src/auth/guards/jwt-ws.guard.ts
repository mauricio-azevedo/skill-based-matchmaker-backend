import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { DefaultEventsMap, Socket } from 'socket.io';

/** shape que queremos em socket.data */
interface AuthData {
  user?: { id: string };
}

@Injectable()
export class JwtWsGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context
      .switchToWs()
      .getClient<Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, AuthData>>();

    const token = (client.handshake.auth as { token?: string } | undefined)?.token;
    if (!token) return false;

    try {
      const { sub } = this.jwt.verify<{ sub: string }>(token);
      client.data.user = { id: sub };
      return true;
    } catch {
      return false;
    }
  }
}
