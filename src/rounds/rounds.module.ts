import { Module } from '@nestjs/common';
import { RoundsService } from './rounds.service';
import { RoundsController } from './rounds.controller';
import { RoundsGateway } from '@/rounds/rounds.gateway';
import { GroupsModule } from '@/groups/groups.module';

@Module({
  imports: [GroupsModule],
  providers: [RoundsService, RoundsGateway],
  controllers: [RoundsController],
})
export class RoundsModule {}
