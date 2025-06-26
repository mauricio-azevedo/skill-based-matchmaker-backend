import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { RoundsService } from './rounds.service';
import { GroupGuard } from '@/groups/group.guard';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentGroup } from '@/common/decorators/current-group';
import { RoundsGateway } from './rounds.gateway';

@UseGuards(JwtAuthGuard, GroupGuard)
@Controller('groups/:groupId/rounds')
export class RoundsController {
  constructor(
    private rounds: RoundsService,
    private gateway: RoundsGateway
  ) {}

  @Get()
  list(@CurrentGroup() groupId: string) {
    return this.rounds.list(groupId);
  }

  @Post()
  async create(
    @CurrentGroup() groupId: string,
    @Body() body: { matches: any[] } // front envia times e níveis
  ) {
    const round = await this.rounds.create(groupId, body);
    this.gateway.emitRoundCreated(groupId, round);
    return round;
  }

  @Patch('matches/:id/score')
  async score(
    @CurrentGroup() groupId: string,
    @Param('id') id: string,
    @Body() body: { gamesA: number; gamesB: number }
  ) {
    const match = await this.rounds.updateScore(id, body.gamesA, body.gamesB);
    this.gateway.emitScoreUpdated(groupId, match);
    return match;
  }

  @Delete(':id')
  async remove(@CurrentGroup() groupId: string, @Param('id') id: string) {
    await this.rounds.delete(id, groupId);
    this.gateway.emitRoundDeleted(groupId, id);
    return { ok: true };
  }
}
