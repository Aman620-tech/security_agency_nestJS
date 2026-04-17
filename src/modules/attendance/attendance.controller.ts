import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('mark')
  @Roles(UserRole.DIRECTOR, UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Mark single attendance' })
  async markAttendance(@Body() markAttendanceDto: MarkAttendanceDto) {
    const attendance = await this.attendanceService.markAttendance(markAttendanceDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Attendance marked successfully',
      data: attendance,
    };
  }

  @Post('bulk')
  @Roles(UserRole.DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Mark bulk attendance' })
  async markBulkAttendance(@Body() bulkAttendanceDto: BulkAttendanceDto) {
    const results = await this.attendanceService.markBulkAttendance(bulkAttendanceDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Bulk attendance processed',
      data: results,
    };
  }

  @Get('guard/:guardId')
  @Roles(UserRole.DIRECTOR, UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Get attendance by guard' })
  @ApiQuery({ name: 'month', required: true, example: 1 })
  @ApiQuery({ name: 'year', required: true, example: 2024 })
  async getAttendanceByGuard(
    @Param('guardId') guardId: string,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const attendances = await this.attendanceService.getAttendanceByGuard(
      guardId,
      parseInt(month),
      parseInt(year),
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Attendance retrieved successfully',
      data: attendances,
    };
  }

  @Get('summary/:guardId')
  @Roles(UserRole.DIRECTOR, UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Get monthly attendance summary' })
  @ApiQuery({ name: 'month', required: true, example: 1 })
  @ApiQuery({ name: 'year', required: true, example: 2024 })
  async getMonthlySummary(
    @Param('guardId') guardId: string,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const summary = await this.attendanceService.getMonthlyAttendanceSummary(
      guardId,
      parseInt(month),
      parseInt(year),
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Summary retrieved successfully',
      data: summary,
    };
  }

  @Get('calendar/:guardId')
  @Roles(UserRole.DIRECTOR, UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Get attendance calendar' })
  @ApiQuery({ name: 'month', required: true, example: 1 })
  @ApiQuery({ name: 'year', required: true, example: 2024 })
  async getCalendar(
    @Param('guardId') guardId: string,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const calendar = await this.attendanceService.getAttendanceCalendar(
      guardId,
      parseInt(month),
      parseInt(year),
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Calendar retrieved successfully',
      data: calendar,
    };
  }
}