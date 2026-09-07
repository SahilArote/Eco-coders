import { IsOptional, IsString, IsNumber, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFarmerProfileDto {
  @ApiPropertyOptional({ example: 'Ramesh Patil' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: 'Panchavati' })
  @IsOptional()
  @IsString()
  village?: string;

  @ApiPropertyOptional({ example: 'Nashik' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ example: 'Maharashtra' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: 'mr', enum: ['en', 'hi', 'mr'] })
  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @ApiPropertyOptional({ example: 4.5 })
  @IsOptional()
  @IsNumber()
  landSizeAcres?: number;

  @ApiPropertyOptional({ example: ['WHEAT', 'SOYBEAN'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  registeredCrops?: string[];
}
