import { IsNotEmpty, IsUUID, IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateScheduleDto {
  @ApiProperty({ description: 'Center ID' })
  @IsNotEmpty()
  @IsUUID()
  centerId: string;

  @ApiProperty({ description: 'Crop ID' })
  @IsNotEmpty()
  @IsUUID()
  cropId: string;

  @ApiProperty({ example: '2026-09-01' })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-10-31' })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 500, description: 'Target daily capacity in Quintals' })
  @IsNotEmpty()
  @IsNumber()
  dailyCapacity: number;

  @ApiPropertyOptional({ default: 'ACTIVE' })
  @IsOptional()
  @IsString()
  status?: string = 'ACTIVE';
}
