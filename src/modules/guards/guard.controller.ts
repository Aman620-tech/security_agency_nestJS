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
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { GuardService } from './guard.service';
import { CreateGuardDto } from './dto/create-guard.dto';
import { UpdateGuardDto } from './dto/update-guard.dto';
import { QueryGuardDto } from './dto/query-guard.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants';

@ApiTags('Guards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('guards')
export class GuardController {
  constructor(private readonly guardService: GuardService) {}

  @Post()
  @Roles(UserRole.DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new guard' })
  @ApiResponse({ status: 201, description: 'Guard created successfully' })
  @ApiResponse({ status: 409, description: 'Duplicate Aadhaar number' })
  async create(@Body() createGuardDto: CreateGuardDto) {
    const guard = await this.guardService.create(createGuardDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Guard created successfully',
      data: guard,
    };
  }

  @Get()
  @Roles(UserRole.DIRECTOR, UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Get all guards with filters' })
  @ApiResponse({ status: 200, description: 'Returns all guards' })
  async findAll(@Query() queryDto: QueryGuardDto) {
    const guards = await this.guardService.findAll(queryDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Guards retrieved successfully',
      data: guards,
      count: guards.length,
    };
  }

  @Get('stats/supervisor-count')
  @Roles(UserRole.DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get guard count by supervisor' })
  async getGuardCountBySupervisor() {
    const stats = await this.guardService.getGuardCountBySupervisor();
    return {
      statusCode: HttpStatus.OK,
      message: 'Statistics retrieved successfully',
      data: stats,
    };
  }

  @Get(':id')
  @Roles(UserRole.DIRECTOR, UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Get guard by ID' })
  async findOne(@Param('id') id: string) {
    const guard = await this.guardService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Guard retrieved successfully',
      data: guard,
    };
  }

  @Get('guard-id/:guardId')
  @Roles(UserRole.DIRECTOR, UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Get guard by Guard ID' })
  async findByGuardId(@Param('guardId') guardId: string) {
    const guard = await this.guardService.findByGuardId(guardId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Guard retrieved successfully',
      data: guard,
    };
  }

  @Patch(':id')
  @Roles(UserRole.DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update guard details' })
  async update(@Param('id') id: string, @Body() updateGuardDto: UpdateGuardDto) {
    const guard = await this.guardService.update(id, updateGuardDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Guard updated successfully',
      data: guard,
    };
  }

  @Delete(':id/deactivate')
  @Roles(UserRole.DIRECTOR)
  @ApiOperation({ summary: 'Deactivate a guard' })
  @HttpCode(HttpStatus.OK)
  async deactivate(@Param('id') id: string) {
    const guard = await this.guardService.deactivate(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Guard deactivated successfully',
      data: guard,
    };
  }
}