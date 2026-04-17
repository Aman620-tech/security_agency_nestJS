import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsMongoId } from 'class-validator';
import { GuardStatus } from '../../../common/constants';

export class QueryGuardDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: GuardStatus })
  @IsEnum(GuardStatus)
  @IsOptional()
  status?: GuardStatus;

  @ApiPropertyOptional()
  @IsMongoId()
  @IsOptional()
  supervisorId?: string;

  @ApiPropertyOptional()
  @IsMongoId()
  @IsOptional()
  tenderId?: string;
}