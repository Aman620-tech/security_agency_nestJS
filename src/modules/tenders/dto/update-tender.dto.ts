import { PartialType } from '@nestjs/swagger';
import { CreateTenderDto } from './create-tender.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TenderStatus } from '../../../common/constants';

export class UpdateTenderDto extends PartialType(CreateTenderDto) {
  @ApiPropertyOptional({ enum: TenderStatus, description: 'Tender status' })
  @IsEnum(TenderStatus)
  @IsOptional()
  status?: TenderStatus;
}