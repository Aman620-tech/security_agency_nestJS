import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsMongoId, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryAttendanceDto {
  @ApiPropertyOptional()
  @IsMongoId()
  @IsOptional()
  guardId?: string;

  @ApiPropertyOptional()
  @IsMongoId()
  @IsOptional()
  tenderId?: string;

  @ApiPropertyOptional({ example: 1, minimum: 1, maximum: 12 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  @IsOptional()
  month?: number;

  @ApiPropertyOptional({ example: 2024 })
  @Type(() => Number)
  @IsInt()
  @Min(2020)
  @Max(2030)
  @IsOptional()
  year?: number;
}