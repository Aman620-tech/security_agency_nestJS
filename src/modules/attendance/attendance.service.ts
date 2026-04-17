import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attendance, AttendanceDocument } from './schemas/attendance.schema';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto';
import { AttendanceStatus, ShiftType } from '../../common/constants';
import moment from 'moment';
  
@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocument>,
  ) {}

  async markAttendance(markAttendanceDto: MarkAttendanceDto): Promise<AttendanceDocument> {
    const date = new Date(markAttendanceDto.date);
    
    const existing = await this.attendanceModel.findOne({
      guard: markAttendanceDto.guardId,
      date: date,
      shiftType: markAttendanceDto.shiftType,
    }).exec();

    if (existing) {
      throw new ConflictException('Attendance already marked for this guard on this date and shift');
    }

    const attendance = new this.attendanceModel({
      guard: markAttendanceDto.guardId,
      date: date,
      tender: markAttendanceDto.tenderId,
      shiftType: markAttendanceDto.shiftType,
      status: markAttendanceDto.status,
    });

    return attendance.save();
  }

  async markBulkAttendance(bulkAttendanceDto: BulkAttendanceDto): Promise<any[]> {
    const date = new Date(bulkAttendanceDto.date);
    const results: any[] = [];

    for (const entry of bulkAttendanceDto.attendances) {
      try {
        const attendance = new this.attendanceModel({
          guard: entry.guardId,
          date: date,
          tender: bulkAttendanceDto.tenderId,
          shiftType: bulkAttendanceDto.shiftType,
          status: entry.status,
        });
        
        await attendance.save();
        results.push({ guardId: entry.guardId, success: true });
      } catch (error: any) {
        results.push({ guardId: entry.guardId, success: false, error: error.message });
      }
    }

    return results;
  }

  async getAttendanceByGuard(guardId: string, month: number, year: number): Promise<AttendanceDocument[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    return this.attendanceModel.find({
      guard: guardId,
      date: { $gte: startDate, $lte: endDate }
    }).populate('tender', 'tenderName').exec();
  }

  async getMonthlyAttendanceSummary(guardId: string, month: number, year: number): Promise<any> {
    const attendances = await this.getAttendanceByGuard(guardId, month, year);
    
    const summary = {
      totalPresent: 0,
      totalAbsent: 0,
      totalHalfDay: 0,
      totalOnLeave: 0,
      nightShifts: 0,
      extraDutyDays: 0,
      dayShifts: 0,
    };
    
    for (const attendance of attendances) {
      if (attendance.shiftType === ShiftType.NIGHT) {
        summary.nightShifts++;
      } else if (attendance.shiftType === ShiftType.EXTRA) {
        summary.extraDutyDays++;
      } else if (attendance.shiftType === ShiftType.DAY) {
        summary.dayShifts++;
      }
      
      switch (attendance.status) {
        case AttendanceStatus.PRESENT:
          summary.totalPresent++;
          break;
        case AttendanceStatus.ABSENT:
          summary.totalAbsent++;
          break;
        case AttendanceStatus.HALF_DAY:
          summary.totalHalfDay++;
          break;
        case AttendanceStatus.ON_LEAVE:
          summary.totalOnLeave++;
          break;
      }
    }
    
    return summary;
  }

  async getAttendanceCalendar(guardId: string, month: number, year: number): Promise<any> {
    const attendances = await this.getAttendanceByGuard(guardId, month, year);
    const calendar: any = {};
    
    for (const attendance of attendances) {
      const dateKey = moment(attendance.date).format('YYYY-MM-DD');
      calendar[dateKey] = {
        shiftType: attendance.shiftType,
        status: attendance.status,
        tender: attendance.tender,
      };
    }
    
    return calendar;
  }
}