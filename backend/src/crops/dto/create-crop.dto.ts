import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCropDto {
  @ApiProperty({ example: 'WHEAT' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ example: 'Wheat (गेहूं)' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'गेहूं (Sharbati & Lokwan)' })
  @IsOptional()
  @IsString()
  nameHi?: string;

  @ApiProperty({ example: 'CEREALS', enum: ['CEREALS', 'PULSES', 'OILSEEDS', 'COMMERCIAL'] })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({ example: 2275, description: 'Minimum Support Price (MSP) in INR per Quintal' })
  @IsNotEmpty()
  @IsNumber()
  mspRatePerQuintal: number;

  @ApiPropertyOptional({ example: 'Quintal', default: 'Quintal' })
  @IsOptional()
  @IsString()
  unit?: string = 'Quintal';

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
