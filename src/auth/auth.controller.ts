import { BadRequestException, Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '@/users/users.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    private users: UsersService
  ) {}

  @Post('register')
  async register(@Body() body: { email: string; password: string }) {
    const exists = await this.users.findByEmail(body.email);
    if (exists) throw new BadRequestException('E-mail já usado');
    const user = await this.users.create(body.email, body.password);
    return { token: this.auth.sign(user) };
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@CurrentUser() user: User) {
    return { token: this.auth.sign(user) };
  }
}
