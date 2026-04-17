import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsInt, Min, Max, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CalculateSalaryDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  guardId: string;

  @ApiProperty({ example: 1, minimum: 1, maximum: 12 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({ example: 2024 })
  @Type(() => Number)
  @IsInt()
  @Min(2020)
  @Max(2030)
  year: number;

  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  @IsOptional()
  save?: boolean;
}