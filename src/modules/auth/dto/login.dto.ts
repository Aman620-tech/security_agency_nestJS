import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'john.doe', description: 'Username or email' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'password123', description: 'Password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}