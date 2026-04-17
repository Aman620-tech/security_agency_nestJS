import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsMobilePhone, MinLength } from 'class-validator';

export class CreateSupervisorDto {
  @ApiProperty({ example: 'Suresh Sharma' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: '9876543210' })
  @IsMobilePhone('en-IN')
  @IsNotEmpty()
  mobileNumber: string;

  @ApiProperty({ example: 'North Zone' })
  @IsString()
  @IsNotEmpty()
  zoneName: string;

  @ApiProperty({ example: 'suresh.sharma' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;
}