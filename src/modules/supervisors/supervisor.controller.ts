import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SupervisorService } from './supervisor.service';
import { CreateSupervisorDto } from './dto/create-supervisor.dto';
import { UpdateSupervisorDto } from './dto/update-supervisor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants';

@ApiTags('Supervisors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('supervisors')
export class SupervisorController {
  constructor(private readonly supervisorService: SupervisorService) {}

  @Post()
  @Roles(UserRole.DIRECTOR)
  @ApiOperation({ summary: 'Create a new supervisor' })
  @ApiResponse({ status: 201, description: 'Supervisor created successfully' })
  async create(@Body() createSupervisorDto: CreateSupervisorDto) {
    const supervisor = await this.supervisorService.create(createSupervisorDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Supervisor created successfully',
      data: supervisor,
    };
  }

  @Get()
  @Roles(UserRole.DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all supervisors' })
  async findAll() {
    const supervisors = await this.supervisorService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Supervisors retrieved successfully',
      data: supervisors,
    };
  }

  @Get(':id')
  @Roles(UserRole.DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get supervisor by ID' })
  async findOne(@Param('id') id: string) {
    const supervisor = await this.supervisorService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Supervisor retrieved successfully',
      data: supervisor,
    };
  }

  @Patch(':id')
  @Roles(UserRole.DIRECTOR)
  @ApiOperation({ summary: 'Update supervisor' })
  async update(@Param('id') id: string, @Body() updateSupervisorDto: UpdateSupervisorDto) {
    const supervisor = await this.supervisorService.update(id, updateSupervisorDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Supervisor updated successfully',
      data: supervisor,
    };
  }

  @Delete(':id')
  @Roles(UserRole.DIRECTOR)
  @ApiOperation({ summary: 'Delete supervisor' })
  async remove(@Param('id') id: string) {
    await this.supervisorService.delete(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Supervisor deleted successfully',
    };
  }
}