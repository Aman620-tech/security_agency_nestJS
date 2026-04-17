import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsEnum, IsMongoId, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ShiftType, AttendanceStatus } from '../../../common/constants';

class BulkAttendanceEntry {
  @IsMongoId()
  guardId: string;

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;
}

export class BulkAttendanceDto {
  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439012' })
  @IsMongoId()
  tenderId: string;

  @ApiProperty({ enum: ShiftType, example: 'day' })
  @IsEnum(ShiftType)
  shiftType: ShiftType;

  @ApiProperty({ type: [BulkAttendanceEntry] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkAttendanceEntry)
  attendances: BulkAttendanceEntry[];
}