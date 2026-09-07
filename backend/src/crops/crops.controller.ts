import { Controller, Get, Post, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CropsService } from './crops.service';
import { CreateCropDto } from './dto/create-crop.dto';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Crops')
@Controller('crops')
export class CropsController {
  constructor(private readonly cropsService: CropsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all available procurement crops with MSP rates' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  async findAll(@Query('activeOnly') activeOnly?: boolean) {
    return this.cropsService.findAll(activeOnly !== false);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get crop details by ID' })
  @ApiResponse({ status: 200, description: 'Crop details' })
  async findOne(@Param('id') id: string) {
    return this.cropsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create new crop and MSP rate (Admin only)' })
  @ApiResponse({ status: 201, description: 'Crop created' })
  async create(@Body() dto: CreateCropDto) {
    return this.cropsService.create(dto);
  }
}
