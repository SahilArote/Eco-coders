import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CenterStatus } from '@prisma/client';

export class CreateCenterDto {
  @ApiProperty({ example: 'MH-NSK-01' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ example: 'APMC Nashik Main Yard' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Panchavati Mandi Complex, Nashik' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ example: 'Panchavati' })
  @IsNotEmpty()
  @IsString()
  village: string;

  @ApiProperty({ example: 'Nashik' })
  @IsNotEmpty()
  @IsString()
  district: string;

  @ApiProperty({ example: 'Maharashtra' })
  @IsNotEmpty()
  @IsString()
  state: string;

  @ApiProperty({ example: 20.011 })
  @IsNotEmpty()
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 73.791 })
  @IsNotEmpty()
  @IsNumber()
  longitude: number;

  @ApiPropertyOptional({ enum: CenterStatus, default: CenterStatus.OPEN })
  @IsOptional()
  @IsEnum(CenterStatus)
  status?: CenterStatus = CenterStatus.OPEN;

  @ApiPropertyOptional({ example: 1500, description: 'Daily capacity in Quintals' })
  @IsOptional()
  @IsNumber()
  dailyCapacityQuintals?: number = 1000;

  @ApiPropertyOptional({ example: '+91 253 251 4488' })
  @IsOptional()
  @IsString()
  contactPhone?: string;
}

export class UpdateCenterDto {
  @ApiPropertyOptional({ example: 'APMC Nashik Main Yard' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Updated address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ enum: CenterStatus })
  @IsOptional()
  @IsEnum(CenterStatus)
  status?: CenterStatus;

  @ApiPropertyOptional({ example: 2000 })
  @IsOptional()
  @IsNumber()
  dailyCapacityQuintals?: number;

  @ApiPropertyOptional({ example: '+91 253 251 9999' })
  @IsOptional()
  @IsString()
  contactPhone?: string;
}
