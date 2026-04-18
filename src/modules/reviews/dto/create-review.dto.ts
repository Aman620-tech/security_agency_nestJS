import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNumber, Min, Max, IsNotEmpty } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ example: 'John Doe', description: 'Reviewer name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'john@example.com', description: 'Reviewer email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Excellent service!', description: 'Review description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 5, description: 'Rating from 1 to 5', minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;

  @ApiProperty({ example: 'Airport Security Tender 2024', description: 'Tender name' })
  @IsString()
  @IsNotEmpty()
  tenderName: string;

  @ApiProperty({ example: 'Downtown Business District', description: 'Area name' })
  @IsString()
  @IsNotEmpty()
  areaName: string;
}