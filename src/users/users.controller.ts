import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { GroupGuard } from '@/groups/group.guard';

@Controller('users')
export class UsersController {
  @Get('me')
  @UseGuards(JwtAuthGuard, GroupGuard)
  getMe(@CurrentUser() user: User): User {
    return user; // populado pelo JwtAuthGuard
  }
}
