import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'oldPassword123' })
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({ example: 'newPassword123' })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  newPassword: string;
}