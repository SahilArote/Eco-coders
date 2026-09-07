import { IsNotEmpty, IsUUID, IsDateString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateSlotsDto {
  @ApiProperty({ description: 'Schedule ID' })
  @IsNotEmpty()
  @IsUUID()
  scheduleId: string;

  @ApiProperty({ example: '2026-09-06' })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: 15, description: 'Capacity per time slot' })
  @IsOptional()
  @IsNumber()
  capacityPerSlot?: number = 15;
}
