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
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(UserRole.DIRECTOR)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'User created successfully',
      data: user,
    };
  }

  @Get()
  @Roles(UserRole.DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({ name: 'role', enum: UserRole, required: false })
  @ApiQuery({ name: 'isActive', type: Boolean, required: false })
  async findAll(
    @Query('role') role?: UserRole,
    @Query('isActive') isActive?: string,
  ) {
    const filters: any = {};
    if (role) filters.role = role;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    
    const users = await this.userService.findAll(filters);
    return {
      statusCode: HttpStatus.OK,
      message: 'Users retrieved successfully',
      data: users,
      count: users.length,
    };
  }

  @Get('supervisors')
  @Roles(UserRole.DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all supervisors' })
  async getSupervisors() {
    const supervisors = await this.userService.getSupervisors();
    return {
      statusCode: HttpStatus.OK,
      message: 'Supervisors retrieved successfully',
      data: supervisors,
    };
  }

  @Get('admins')
  @Roles(UserRole.DIRECTOR)
  @ApiOperation({ summary: 'Get all admins' })
  async getAdmins() {
    const admins = await this.userService.getAdmins();
    return {
      statusCode: HttpStatus.OK,
      message: 'Admins retrieved successfully',
      data: admins,
    };
  }

  @Get(':id')
  @Roles(UserRole.DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'User retrieved successfully',
      data: user,
    };
  }

  @Patch(':id')
  @Roles(UserRole.DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update user' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.userService.update(id, updateUserDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'User updated successfully',
      data: user,
    };
  }

  @Delete(':id/deactivate')
  @Roles(UserRole.DIRECTOR)
  @ApiOperation({ summary: 'Deactivate user' })
  async deactivate(@Param('id') id: string) {
    const user = await this.userService.deactivate(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'User deactivated successfully',
      data: user,
    };
  }

  @Post(':id/activate')
  @Roles(UserRole.DIRECTOR)
  @ApiOperation({ summary: 'Activate user' })
  async activate(@Param('id') id: string) {
    const user = await this.userService.activate(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'User activated successfully',
      data: user,
    };
  }

  @Delete(':id')
  @Roles(UserRole.DIRECTOR)
  @ApiOperation({ summary: 'Delete user' })
  async remove(@Param('id') id: string) {
    await this.userService.delete(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'User deleted successfully',
    };
  }
}