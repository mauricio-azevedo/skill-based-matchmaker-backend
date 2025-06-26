import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PlayersService } from './players.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CurrentGroup } from '@/common/decorators/current-group';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { GroupGuard } from '@/groups/group.guard';
import { User } from '@prisma/client';

@UseGuards(JwtAuthGuard, GroupGuard)
@Controller('groups/:groupId/players')
export class PlayersController {
  constructor(private players: PlayersService) {}

  @Get()
  list(@CurrentGroup() groupId: string) {
    return this.players.list(groupId);
  }

  @Post()
  create(@CurrentGroup() groupId: string, @CurrentUser() _user: User, @Body() body: { name: string; level: number }) {
    return this.players.create(groupId, body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentGroup() groupId: string,
    @Body() body: Partial<{ name: string; level: number; active: boolean }>
  ) {
    return this.players.update(id, groupId, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentGroup() groupId: string) {
    return this.players.remove(id, groupId);
  }
}
