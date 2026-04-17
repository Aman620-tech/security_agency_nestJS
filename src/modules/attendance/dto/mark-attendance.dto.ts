import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsDateString, IsEnum, IsNotEmpty } from 'class-validator';
import { ShiftType, AttendanceStatus } from '../../../common/constants';

export class MarkAttendanceDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  @IsNotEmpty()
  guardId: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439012' })
  @IsMongoId()
  @IsNotEmpty()
  tenderId: string;

  @ApiProperty({ enum: ShiftType, example: 'day' })
  @IsEnum(ShiftType)
  @IsNotEmpty()
  shiftType: ShiftType;

  @ApiProperty({ enum: AttendanceStatus, example: 'present' })
  @IsEnum(AttendanceStatus)
  @IsNotEmpty()
  status: AttendanceStatus;
}