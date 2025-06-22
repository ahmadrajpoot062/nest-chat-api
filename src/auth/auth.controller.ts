// src/auth/auth.controller.ts
import { Controller, Post, UploadedFile, UseInterceptors, Body, UnauthorizedException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('avatar', {
    storage: diskStorage({
      destination: './uploads/avatars',
      filename: (_, file, cb) => {
        const name = `${Date.now()}${extname(file.originalname)}`;
        cb(null, name);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  async register(@UploadedFile() file: Express.Multer.File, @Body() dto: RegisterDto) {
    const avatar = file?.filename;
    const user = await this.authService.register(dto.username, dto.password, avatar);
    return { message: 'User registered', user };
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.username, dto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return this.authService.login(user);
  }
}
