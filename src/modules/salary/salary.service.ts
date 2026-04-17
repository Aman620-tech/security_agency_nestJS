import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Salary, SalaryDocument } from './schemas/salary.schema';
import { GuardService } from '../guards/guard.service';
import { AttendanceService } from '../attendance/attendance.service';
import { SalaryStatus } from './dto/salary-response.dto';

@Injectable()
export class SalaryService {
  private readonly logger = new Logger(SalaryService.name);
  
  constructor(
    @InjectModel(Salary.name) private salaryModel: Model<SalaryDocument>,
    private guardService: GuardService,
    private attendanceService: AttendanceService,
    private configService: ConfigService,
  ) {}

  async calculateSalaryForGuard(guardId: string, month: number, year: number): Promise<any> {
    const guard = await this.guardService.findOne(guardId);
    const attendanceSummary = await this.attendanceService.getMonthlyAttendanceSummary(guardId, month, year);
    
    const workingDaysPerMonth = this.configService.get<number>('workingDaysPerMonth');
    const perDayRate = guard.basicMonthlySalary / workingDaysPerMonth;
    
    // Calculate earned basic (Half day = 0.5 day)
    const earnedDays = attendanceSummary.totalPresent + (attendanceSummary.totalHalfDay * 0.5);
    const earnedBasic = perDayRate * earnedDays;
    
    // Calculate night allowance
    const nightAllowanceRate = this.configService.get<number>('nightAllowanceRate');
    const nightAllowance = attendanceSummary.nightShifts * nightAllowanceRate;
    
    // Calculate extra duty pay
    const extraDutyPay = attendanceSummary.extraDutyDays * perDayRate;
    
    // Calculate gross salary
    const grossSalary = earnedBasic + nightAllowance + extraDutyPay;
    
    // Calculate deductions
    let esiDeduction = 0;
    let pfDeduction = 0;
    
    if (guard.esiApplicable) {
      esiDeduction = grossSalary * 0.0075; // 0.75%
    }
    
    if (guard.pfApplicable) {
      pfDeduction = guard.basicMonthlySalary * 0.12; // 12% of basic
    }
    
    const totalDeductions = esiDeduction + pfDeduction;
    const netSalary = grossSalary - totalDeductions;
    
    return {
      guard: guard._id,
      guardId: guard.guardId,
      guardName: guard.fullName,
      assignedTender: guard.assignedTender,
      month,
      year,
      basicSalary: guard.basicMonthlySalary,
      perDayRate,
      daysPresent: earnedDays,
      earnedBasic,
      nightShifts: attendanceSummary.nightShifts,
      nightAllowance,
      extraDutyDays: attendanceSummary.extraDutyDays,
      extraDutyPay,
      grossSalary,
      esiApplicable: guard.esiApplicable,
      esiDeduction,
      pfApplicable: guard.pfApplicable,
      pfDeduction,
      totalDeductions,
      netSalary,
      attendanceSummary: {
        totalPresent: attendanceSummary.totalPresent,
        totalAbsent: attendanceSummary.totalAbsent,
        totalHalfDay: attendanceSummary.totalHalfDay,
        totalOnLeave: attendanceSummary.totalOnLeave,
      },
    };
  }

  async calculateAndSaveSalary(guardId: string, month: number, year: number, lockedBy?: string): Promise<SalaryDocument> {
    // Check if already exists and locked
    const existingSalary = await this.salaryModel.findOne({ guard: guardId, month, year }).exec();
    
    if (existingSalary && existingSalary.isLocked) {
      throw new BadRequestException('Salary for this month is already locked and cannot be recalculated');
    }
    
    const calculatedSalary = await this.calculateSalaryForGuard(guardId, month, year);
    
    const salaryData = {
      guard: guardId,
      month,
      year,
      basicSalary: calculatedSalary.basicSalary,
      perDayRate: calculatedSalary.perDayRate,
      daysPresent: calculatedSalary.daysPresent,
      earnedBasic: calculatedSalary.earnedBasic,
      nightShifts: calculatedSalary.nightShifts,
      nightAllowance: calculatedSalary.nightAllowance,
      extraDutyDays: calculatedSalary.extraDutyDays,
      extraDutyPay: calculatedSalary.extraDutyPay,
      grossSalary: calculatedSalary.grossSalary,
      esiDeduction: calculatedSalary.esiDeduction,
      pfDeduction: calculatedSalary.pfDeduction,
      totalDeductions: calculatedSalary.totalDeductions,
      netSalary: calculatedSalary.netSalary,
    };
    
    if (existingSalary) {
      const updated = await this.salaryModel.findByIdAndUpdate(
        existingSalary._id,
        salaryData,
        { new: true }
      ).exec();
      return updated;
    } else {
      const salary = new this.salaryModel(salaryData);
      return salary.save();
    }
  }

  async lockSalaryMonth(month: number, year: number, lockedBy: string): Promise<void> {
    const result = await this.salaryModel.updateMany(
      { month, year, isLocked: false },
      { 
        isLocked: true, 
        lockedAt: new Date(),
        lockedBy 
      }
    ).exec();
    
    this.logger.log(`Locked ${result.modifiedCount} salary records for ${month}/${year}`);
  }

  async getMonthlySalaryReport(month: number, year: number): Promise<any[]> {
    const salaries = await this.salaryModel.find({ month, year })
      .populate('guard', 'fullName guardId assignedTender')
      .exec();
    
    return salaries.map(salary => ({
      guardName: (salary.guard as any).fullName,
      guardId: (salary.guard as any).guardId,
      basicSalary: salary.basicSalary,
      earnedBasic: salary.earnedBasic,
      nightAllowance: salary.nightAllowance,
      extraDutyPay: salary.extraDutyPay,
      grossSalary: salary.grossSalary,
      esiDeduction: salary.esiDeduction,
      pfDeduction: salary.pfDeduction,
      netSalary: salary.netSalary,
    }));
  }
}