import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignOperatorDto {
  @ApiProperty({ description: 'User ID of the operator' })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Procurement Center ID' })
  @IsNotEmpty()
  @IsUUID()
  centerId: string;
}
