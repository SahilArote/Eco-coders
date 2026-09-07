import { IsNotEmpty, IsNumber, Min, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WeighmentDto {
  @ApiProperty({ example: 4500.0, description: 'Gross Weight (Vehicle + Produce) in Kilograms' })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  grossWeightKg: number;

  @ApiProperty({ example: 1200.0, description: 'Tare Weight (Empty Vehicle) in Kilograms' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  tareWeightKg: number;

  @ApiPropertyOptional({ example: 'WB-01', default: 'WB-01' })
  @IsOptional()
  @IsString()
  weighbridgeId?: string = 'WB-01';
}

export class RejectProcurementDto {
  @ApiProperty({ example: 'Moisture content exceeds maximum allowable limit of 14%.' })
  @IsNotEmpty()
  @IsString()
  rejectionReason: string;
}
