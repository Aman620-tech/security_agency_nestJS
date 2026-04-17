import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TenderService } from './tender.service';
import { CreateTenderDto } from './dto/create-tender.dto';
import { UpdateTenderDto } from './dto/update-tender.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, TenderStatus } from '../../common/constants';

@ApiTags('Tenders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tenders')
export class TenderController {
  constructor(private readonly tenderService: TenderService) {}

  @Post()
  @Roles(UserRole.DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new tender' })
  async create(@Body() createTenderDto: CreateTenderDto) {
    const tender = await this.tenderService.create(createTenderDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Tender created successfully',
      data: tender,
    };
  }

  @Get()
  @Roles(UserRole.DIRECTOR, UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Get all tenders' })
  @ApiQuery({ name: 'status', enum: TenderStatus, required: false })
  async findAll(@Query('status') status?: TenderStatus) {
    const tenders = await this.tenderService.findAll(status);
    return {
      statusCode: HttpStatus.OK,
      message: 'Tenders retrieved successfully',
      data: tenders,
    };
  }

  @Get('expiring')
  @Roles(UserRole.DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get expiring tenders' })
  @ApiQuery({ name: 'days', required: false, description: 'Days threshold (default: 30)' })
  async getExpiringTenders(@Query('days') days?: string) {
    const daysThreshold = days ? parseInt(days) : 30;
    const tenders = await this.tenderService.getExpiringTenders(daysThreshold);
    return {
      statusCode: HttpStatus.OK,
      message: 'Expiring tenders retrieved successfully',
      data: tenders,
    };
  }

  @Get('active')
  @Roles(UserRole.DIRECTOR, UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Get active tenders' })
  async getActiveTenders() {
    const tenders = await this.tenderService.getActiveTenders();
    return {
      statusCode: HttpStatus.OK,
      message: 'Active tenders retrieved successfully',
      data: tenders,
    };
  }

  @Get(':id')
  @Roles(UserRole.DIRECTOR, UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Get tender by ID' })
  async findOne(@Param('id') id: string) {
    const tender = await this.tenderService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Tender retrieved successfully',
      data: tender,
    };
  }

  @Patch(':id')
  @Roles(UserRole.DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update tender' })
  async update(@Param('id') id: string, @Body() updateTenderDto: UpdateTenderDto) {
    const tender = await this.tenderService.update(id, updateTenderDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Tender updated successfully',
      data: tender,
    };
  }

  @Delete(':id/close')
  @Roles(UserRole.DIRECTOR)
  @ApiOperation({ summary: 'Close tender' })
  async closeTender(@Param('id') id: string) {
    const tender = await this.tenderService.closeTender(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Tender closed successfully',
      data: tender,
    };
  }
}