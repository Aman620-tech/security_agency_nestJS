import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/constants';

export class UserResponseDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  mobileNumber: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  zoneName?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  lastLoginAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}