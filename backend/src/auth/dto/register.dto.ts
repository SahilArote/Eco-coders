import {
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: '9876543210', description: '10-digit Indian mobile number' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[6-9]\d{9}$/, { message: 'Phone number must be a valid 10-digit Indian mobile number' })
  phone: string;

  @ApiProperty({ example: 'Farmer@123', description: 'Password with minimum 6 characters' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({ example: 'Ramesh Patil', description: 'Full Name' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiPropertyOptional({ enum: Role, default: Role.FARMER })
  @IsOptional()
  @IsEnum(Role)
  role?: Role = Role.FARMER;

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
}
