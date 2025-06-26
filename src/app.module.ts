import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PingGateway } from '@/gateway/ping.gateway';
import { GroupsModule } from './groups/groups.module';
import { PlayersModule } from './players/players.module';
import { RoundsModule } from './rounds/rounds.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    GroupsModule,
    GroupsModule,
    PlayersModule,
    RoundsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PingGateway],
})
export class AppModule {}
