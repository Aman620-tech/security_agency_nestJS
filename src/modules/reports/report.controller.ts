import { Controller, Get, Query, UseGuards, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportService } from './report.service';
import { ReportQueryDto } from './dto/report-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('attendance')
  @Roles(UserRole.DIRECTOR, UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Get attendance report' })
  async getAttendanceReport(@Query() queryDto: ReportQueryDto) {
    const report = await this.reportService.getAttendanceReport(queryDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Attendance report generated successfully',
      data: report,
    };
  }

  @Get('tender-deployment')
  @Roles(UserRole.DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get tender deployment report' })
  async getTenderDeploymentReport(@Query('tenderId') tenderId?: string) {
    const report = await this.reportService.getTenderDeploymentReport(tenderId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Tender deployment report generated successfully',
      data: report,
    };
  }

  @Get('monthly-salary-summary')
  @Roles(UserRole.DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get monthly salary summary' })
  async getMonthlySalarySummary(
    @Query('month') month: string,
    @Query('year') year: string,
    @Query('groupBy') groupBy?: string,
  ) {
    const report = await this.reportService.getMonthlySalarySummary(
      parseInt(month),
      parseInt(year),
      groupBy,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Salary summary report generated successfully',
      data: report,
    };
  }

  @Get('absenteeism')
  @Roles(UserRole.DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get absenteeism report' })
  async getAbsenteeismReport(@Query() queryDto: ReportQueryDto) {
    const report = await this.reportService.getAbsenteeismReport(
      queryDto.month,
      queryDto.year,
      queryDto.absentThreshold || 5,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Absenteeism report generated successfully',
      data: report,
    };
  }

  @Get('contract-expiry')
  @Roles(UserRole.DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get contract expiry report' })
  async getContractExpiryReport(@Query('days') days?: string) {
    const report = await this.reportService.getContractExpiryReport(
      days ? parseInt(days) : 30,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Contract expiry report generated successfully',
      data: report,
    };
  }

  // FIXED: Excel Export with proper Buffer handling
  @Get('export/excel')
  @Roles(UserRole.DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Export report to Excel' })
  async exportToExcel(@Query() queryDto: ReportQueryDto, @Res() res: Response) {
    try {
      const buffer = await this.reportService.exportToExcel(queryDto);
      
      // Set response headers for Excel file download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=attendance-report.xlsx');
      res.setHeader('Content-Length', buffer.length);
      
      // Send the buffer
      res.send(buffer);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to generate Excel report',
        error: error.message,
      });
    }
  }

  // New: Export to CSV
  @Get('export/csv')
  @Roles(UserRole.DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Export report to CSV' })
  async exportToCsv(@Query() queryDto: ReportQueryDto, @Res() res: Response) {
    try {
      const buffer = await this.reportService.exportToCsv(queryDto);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=attendance-report.csv');
      res.setHeader('Content-Length', buffer.length);
      
      res.send(buffer);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to generate CSV report',
        error: error.message,
      });
    }
  }
}