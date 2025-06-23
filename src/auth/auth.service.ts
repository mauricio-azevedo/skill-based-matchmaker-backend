import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService
  ) {}

  async validateUser(email: string, pass: string) {
    return this.users.validateUser(email, pass);
  }

  sign(user: { id: string }) {
    return this.jwt.sign({ sub: user.id });
  }
}
