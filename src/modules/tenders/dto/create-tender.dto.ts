import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsMobilePhone,
  IsEmail,
  IsOptional,
  IsNumber,
  Min,
  IsDateString,
} from 'class-validator';

export class CreateTenderDto {
  @ApiProperty({ example: 'Infosys Gate 1' })
  @IsString()
  @IsNotEmpty()
  tenderName: string;

  @ApiProperty({ example: 'Rajesh Mehta' })
  @IsString()
  @IsNotEmpty()
  ownerName: string;

  @ApiProperty({ example: 'Infosys Technologies' })
  @IsString()
  @IsNotEmpty()
  ownerCompanyName: string;

  @ApiProperty({ example: '9876543210' })
  @IsMobilePhone('en-IN')
  @IsNotEmpty()
  ownerContactNumber: string;

  @ApiProperty({ example: 'contact@infosys.com', required: false })
  @IsEmail()
  @IsOptional()
  ownerEmail?: string;

  @ApiProperty({ example: 'Electronic City, Bangalore' })
  @IsString()
  @IsNotEmpty()
  siteAddress: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  requiredGuards: number;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  @IsNotEmpty()
  contractStartDate: string;

  @ApiProperty({ example: '2024-12-31' })
  @IsDateString()
  @IsNotEmpty()
  contractEndDate: string;

  @ApiProperty({ example: 150000, required: false })
  @IsNumber()
  @IsOptional()
  monthlyContractValue?: number;
}