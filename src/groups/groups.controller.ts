import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { User } from '@prisma/client';

@UseGuards(JwtAuthGuard) // já exige login
@Controller('groups')
export class GroupsController {
  constructor(private groups: GroupsService) {}

  /** POST /groups  { name }  → cria grupo */
  @Post()
  async create(@Body() body: { name: string }, @CurrentUser() user: User) {
    const group = await this.groups.createGroup(body.name, user.id);
    return { id: group.id, name: group.name, inviteCode: group.inviteCode };
  }

  /** GET /groups  → grupos do usuário */
  @Get()
  list(@CurrentUser() user: User) {
    return this.groups.findUserGroups(user.id);
  }

  /** POST /groups/join  { code } */
  @Post('join')
  async join(@Body() body: { code: string }, @CurrentUser() user: User) {
    const group = await this.groups.joinByCode(user.id, body.code);
    return { id: group.id, name: group.name };
  }
}
