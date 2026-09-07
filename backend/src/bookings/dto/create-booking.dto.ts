import {
  IsNotEmpty,
  IsUUID,
  IsNumber,
  Min,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ description: 'Procurement Center ID' })
  @IsNotEmpty()
  @IsUUID()
  centerId: string;

  @ApiProperty({ description: 'Crop ID' })
  @IsNotEmpty()
  @IsUUID()
  cropId: string;

  @ApiProperty({ description: 'Slot ID' })
  @IsNotEmpty()
  @IsUUID()
  slotId: string;

  @ApiProperty({ example: 40, description: 'Estimated quantity in Quintals' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.1, { message: 'Quantity must be at least 0.1 Quintals' })
  quantityQuintals: number;

  @ApiPropertyOptional({ example: 'tractor', enum: ['tractor', 'truck', 'cart'] })
  @IsOptional()
  @IsString()
  vehicleType?: string;
}
