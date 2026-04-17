import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpStatus,
  UseGuards,
  Res,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';
import { SalaryService } from './salary.service';
import { CalculateSalaryDto } from './dto/calculate-salary.dto';
import { LockSalaryDto } from './dto/lock-salary.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants';

@ApiTags('Salary')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('salary')
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  @Post('calculate')
  @Roles(UserRole.DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Calculate salary for a guard' })
  async calculateSalary(@Body() calculateSalaryDto: CalculateSalaryDto) {
    if (calculateSalaryDto.save) {
      const salary = await this.salaryService.calculateAndSaveSalary(
        calculateSalaryDto.guardId,
        calculateSalaryDto.month,
        calculateSalaryDto.year,
        'system',
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Salary calculated and saved successfully',
        data: salary,
      };
    } else {
      const salary = await this.salaryService.calculateSalaryForGuard(
        calculateSalaryDto.guardId,
        calculateSalaryDto.month,
        calculateSalaryDto.year,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Salary calculated successfully',
        data: salary,
      };
    }
  }

  @Post('lock-month')
  @Roles(UserRole.DIRECTOR)
  @ApiOperation({ summary: 'Lock salary for a month' })
  async lockSalaryMonth(@Body() lockSalaryDto: LockSalaryDto, @Req() req: any) {
    await this.salaryService.lockSalaryMonth(
      lockSalaryDto.month,
      lockSalaryDto.year,
      req.user?.id || 'system',
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Salary month locked successfully',
    };
  }

  @Get('report/:month/:year')
  @Roles(UserRole.DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get monthly salary report' })
  async getMonthlyReport(@Param('month') month: string, @Param('year') year: string) {
    const report = await this.salaryService.getMonthlySalaryReport(
      parseInt(month),
      parseInt(year),
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Salary report retrieved successfully',
      data: report,
    };
  }

  @Get('slip/:guardId/:month/:year')
  @Roles(UserRole.DIRECTOR, UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Generate salary slip PDF' })
  async generateSalarySlip(
    @Param('guardId') guardId: string,
    @Param('month') month: string,
    @Param('year') year: string,
    @Res() res: Response,
  ) {
    const salary = await this.salaryService.calculateSalaryForGuard(
      guardId,
      parseInt(month),
      parseInt(year),
    );
    return res.json({
      statusCode: HttpStatus.OK,
      message: 'Salary slip generated',
      data: salary,
    });
  }
}