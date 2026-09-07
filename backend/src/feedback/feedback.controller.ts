import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Feedback & Grievances')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Roles(Role.FARMER)
  @Post()
  @ApiOperation({ summary: 'Submit feedback or grievance for completed procurement' })
  @ApiResponse({ status: 201, description: 'Feedback submitted' })
  async submit(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateFeedbackDto,
  ) {
    return this.feedbackService.submitFeedback(user.userId, dto);
  }

  @Roles(Role.ADMIN)
  @Get()
  @ApiOperation({ summary: 'List all farmer feedback and grievances (Admin only)' })
  async getAll() {
    return this.feedbackService.getAllFeedback();
  }
}
