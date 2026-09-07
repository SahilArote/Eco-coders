import {
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QualityGrade, QualityStatus } from '@prisma/client';

export class QualityCheckDto {
  @ApiProperty({ example: 10.5, description: 'Moisture percentage (0-100%)' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  moisturePercentage: number;

  @ApiPropertyOptional({ example: 12.0, default: 12.0 })
  @IsOptional()
  @IsNumber()
  moistureStandardMax?: number = 12.0;

  @ApiPropertyOptional({ example: 0.5, default: 0.0 })
  @IsOptional()
  @IsNumber()
  foreignMatterPercentage?: number = 0.0;

  @ApiProperty({ enum: QualityGrade, example: QualityGrade.GRADE_A })
  @IsNotEmpty()
  @IsEnum(QualityGrade)
  qualityGrade: QualityGrade;

  @ApiProperty({ enum: QualityStatus, example: QualityStatus.PASSED })
  @IsNotEmpty()
  @IsEnum(QualityStatus)
  qualityStatus: QualityStatus;

  @ApiPropertyOptional({ example: 'Clean wheat sample within acceptable moisture limits.' })
  @IsOptional()
  @IsString()
  remarks?: string;
}
