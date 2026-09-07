import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: '9876543210', description: 'Phone number or email' })
  @IsNotEmpty()
  @IsString()
  identifier: string;

  @ApiProperty({ example: 'Farmer@123', description: 'Password' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
