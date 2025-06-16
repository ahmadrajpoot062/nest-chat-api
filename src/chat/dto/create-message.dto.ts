import { IsString, IsNotEmpty } from 'class-validator';
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
}
