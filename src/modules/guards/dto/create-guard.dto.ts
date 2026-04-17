import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsMobilePhone,
  IsDateString,
  IsNumber,
  Min,
  IsBoolean,
  IsOptional,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGuardDto {
  @ApiProperty({ example: 'Rajesh Kumar' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: '9876543210' })
  @IsMobilePhone('en-IN')
  @IsNotEmpty()
  mobileNumber: string;

  @ApiProperty({ example: '123, Main Street, New Delhi' })
  @IsString()
  @IsNotEmpty()
  residentialAddress: string;

  @ApiProperty({ example: '1234-5678-9012' })
  @IsString()
  @IsNotEmpty()
  aadhaarNumber: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  @IsNotEmpty()
  dateOfJoining: string;

  @ApiProperty({ example: 12500 })
  @IsNumber()
  @Min(0)
  basicMonthlySalary: number;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  @IsNotEmpty()
  assignedSupervisor: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439012' })
  @IsMongoId()
  @IsNotEmpty()
  assignedTender: string;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  esiApplicable?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  pfApplicable?: boolean;
}