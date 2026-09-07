import { IsNotEmpty, IsString, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BankKycDto {
  @ApiProperty({ example: 'Ramesh Patil' })
  @IsNotEmpty()
  @IsString()
  accountHolderName: string;

  @ApiProperty({ example: 'State Bank of India' })
  @IsNotEmpty()
  @IsString()
  bankName: string;

  @ApiProperty({ example: '123456789012', description: '9 to 18 digit account number' })
  @IsNotEmpty()
  @IsString()
  @Length(9, 18, { message: 'Bank account number must be between 9 and 18 digits' })
  accountNumber: string;

  @ApiProperty({ example: 'SBIN0001234', description: '11-character IFSC code' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, { message: 'Invalid Indian Financial System Code (IFSC)' })
  ifscCode: string;
}
