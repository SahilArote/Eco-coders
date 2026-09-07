import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({ example: '9876543210', description: '10-digit Indian mobile number' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[6-9]\d{9}$/, { message: 'Phone number must be a valid 10-digit Indian mobile number' })
  phone: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '9876543210' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[6-9]\d{9}$/)
  phone: string;

  @ApiProperty({ example: '123456', description: '6-digit OTP' })
  @IsNotEmpty()
  @IsString()
  otp: string;
}
