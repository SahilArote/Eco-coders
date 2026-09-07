import { Controller, Get, Patch, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FarmersService } from './farmers.service';
import { UpdateFarmerProfileDto } from './dto/update-profile.dto';
import { BankKycDto } from './dto/bank-kyc.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Farmers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('farmers')
export class FarmersController {
  constructor(private readonly farmersService: FarmersService) {}

  @Get('profile')
  @Roles(Role.FARMER)
  @ApiOperation({ summary: 'Get authenticated farmer profile & KYC status' })
  @ApiResponse({ status: 200, description: 'Farmer profile' })
  async getProfile(@CurrentUser() user: RequestUser) {
    return this.farmersService.getProfileByUserId(user.userId);
  }

  @Patch('profile')
  @Roles(Role.FARMER)
  @ApiOperation({ summary: 'Update farmer personal profile details' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async updateProfile(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateFarmerProfileDto,
  ) {
    return this.farmersService.updateProfile(user.userId, dto);
  }

  @Post('kyc/bank')
  @Roles(Role.FARMER)
  @ApiOperation({ summary: 'Submit and verify bank account details for DBT payout' })
  @ApiResponse({ status: 200, description: 'Bank details verified' })
  async submitBankKyc(
    @CurrentUser() user: RequestUser,
    @Body() dto: BankKycDto,
  ) {
    return this.farmersService.submitBankKyc(user.userId, dto);
  }
}
