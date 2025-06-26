import { Module } from '@nestjs/common';
import { RoundsService } from './rounds.service';
import { RoundsController } from './rounds.controller';
import { RoundsGateway } from '@/rounds/rounds.gateway';

@Module({
  providers: [RoundsService, RoundsGateway],
  controllers: [RoundsController],
})
export class RoundsModule {}
