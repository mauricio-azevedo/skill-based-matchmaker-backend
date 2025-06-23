import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('users')
export class UsersController {
  @Get('me')
  getMe(@CurrentUser() user: User): User {
    return user; // populado pelo JwtAuthGuard
  }
}
