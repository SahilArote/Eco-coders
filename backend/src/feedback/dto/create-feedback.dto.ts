import { IsNotEmpty, IsString, IsInt, Min, Max, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFeedbackDto {
  @ApiPropertyOptional({ description: 'Associated Booking ID' })
  @IsOptional()
  @IsUUID()
  bookingId?: string;

  @ApiProperty({ example: 'DELAY_COMPLAINT', enum: ['DELAY_COMPLAINT', 'PAYMENT_DISPUTE', 'QUALITY_DISPUTE', 'SERVICE_COMPLIMENT', 'GENERAL'] })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({ example: 4, minimum: 1, maximum: 5 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'Smooth weighment process, but waiting area needed more seating.' })
  @IsNotEmpty()
  @IsString()
  comments: string;
}
