// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password: _, ...rest } = user.toObject();
      return rest;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      username: user.username,
      sub: user._id,
      avatar: user.avatar, // ✅ include avatar
    };
    return { access_token: this.jwtService.sign(payload), user };
  }

  async register(username: string, password: string, avatar?: string) {
    const hash = await bcrypt.hash(password, 10);
    return this.usersService.create(username, hash, avatar);
  }
}
