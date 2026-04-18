import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateReviewDto {
  @ApiPropertyOptional({ example: true, description: 'Show or hide this review publicly' })
  @IsBoolean()
  @IsOptional()
  is_show?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Soft delete this review' })
  @IsBoolean()
  @IsOptional()
  is_deleted?: boolean;
}