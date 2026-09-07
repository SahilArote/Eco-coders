import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CentersService } from './centers.service';
import { CreateCenterDto, UpdateCenterDto } from './dto/create-center.dto';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Procurement Centers')
@Controller('centers')
export class CentersController {
  constructor(private readonly centersService: CentersService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all procurement centers with distance & filters' })
  @ApiQuery({ name: 'district', required: false })
  @ApiQuery({ name: 'cropId', required: false })
  @ApiQuery({ name: 'userLat', required: false, type: Number })
  @ApiQuery({ name: 'userLon', required: false, type: Number })
  async findAll(
    @Query('district') district?: string,
    @Query('cropId') cropId?: string,
    @Query('userLat') userLat?: number,
    @Query('userLon') userLon?: number,
  ) {
    return this.centersService.findAll({ district, cropId, userLat, userLon });
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get procurement center details by ID' })
  @ApiResponse({ status: 200, description: 'Center details' })
  async findOne(@Param('id') id: string) {
    return this.centersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create new procurement center (Admin only)' })
  @ApiResponse({ status: 201, description: 'Center created' })
  async create(@Body() dto: CreateCenterDto) {
    return this.centersService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Update procurement center configuration (Admin only)' })
  @ApiResponse({ status: 200, description: 'Center updated' })
  async update(@Param('id') id: string, @Body() dto: UpdateCenterDto) {
    return this.centersService.update(id, dto);
  }
}
