import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({ example: 'room1' })
  @IsString()
  @IsNotEmpty()
  room: string;

  @ApiProperty({ example: 'Hello world!' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: 'https://example.com/file.png', required: false })
  @IsString()
  @IsOptional()
  file?: string; // For emoji image/file base64 or public URL
}
