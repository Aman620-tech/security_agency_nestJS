import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class LockSalaryDto {
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
}