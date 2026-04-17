import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsMobilePhone,
  IsEnum,
  IsOptional,
  MinLength,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { UserRole } from '../../../common/constants';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'john.doe' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: '9876543210' })
  @IsMobilePhone('en-IN')
  @IsNotEmpty()
  mobileNumber: string;

  @ApiProperty({ enum: UserRole, example: UserRole.SUPERVISOR })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @ApiProperty({ example: 'North Zone', required: false })
  @IsString()
  @IsOptional()
  zoneName?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  permissions?: {
    canCreateGuard?: boolean;
    canEditGuard?: boolean;
    canDeleteGuard?: boolean;
    canCreateTender?: boolean;
    canEditTender?: boolean;
    canDeleteTender?: boolean;
    canMarkAttendance?: boolean;
    canGenerateReports?: boolean;
    canManageUsers?: boolean;
  };
}