import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user123' })
  @IsString()
  @IsNotEmpty({ message: 'Username must not be empty' })
  username: string;

  @ApiProperty({ example: 'securepassword123' })
  @IsString()
  @IsNotEmpty({ message: 'Password must not be empty' })
  password: string;

  @ApiProperty({ required: false, example: 'avatar.jpg' })
  @IsOptional()
  @IsString()
  avatar?: string;
}
