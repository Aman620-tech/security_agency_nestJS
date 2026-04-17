import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Guard, GuardDocument } from '../guards/schemas/guard.schema';
import { Tender, TenderDocument } from '../tenders/schemas/tender.schema';
import { Attendance, AttendanceDocument } from '../attendance/schemas/attendance.schema';
import { Salary, SalaryDocument } from '../salary/schemas/salary.schema';
import { ReportQueryDto } from './dto/report-query.dto';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Guard.name) private guardModel: Model<GuardDocument>,
    @InjectModel(Tender.name) private tenderModel: Model<TenderDocument>,
    @InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocument>,
    @InjectModel(Salary.name) private salaryModel: Model<SalaryDocument>,
  ) {}

  async getAttendanceReport(queryDto: ReportQueryDto): Promise<any> {
    const matchConditions: any = {};
    
    if (queryDto.guardId) {
      matchConditions.guard = queryDto.guardId;
    }
    
    if (queryDto.tenderId) {
      matchConditions.tender = queryDto.tenderId;
    }
    
    if (queryDto.startDate || queryDto.endDate) {
      matchConditions.date = {};
      if (queryDto.startDate) matchConditions.date.$gte = new Date(queryDto.startDate);
      if (queryDto.endDate) matchConditions.date.$lte = new Date(queryDto.endDate);
    }
    
    const report = await this.attendanceModel.aggregate([
      { $match: matchConditions },
      {
        $lookup: {
          from: 'guards',
          localField: 'guard',
          foreignField: '_id',
          as: 'guardInfo',
        },
      },
      { $unwind: '$guardInfo' },
      {
        $group: {
          _id: {
            guardId: '$guard',
            guardName: '$guardInfo.fullName',
            status: '$status',
          },
          count: { $sum: 1 },
        },
      },
    ]);
    
    return report;
  }

  async getTenderDeploymentReport(tenderId?: string): Promise<any> {
    const matchConditions: any = { status: 'active' };
    if (tenderId) {
      matchConditions._id = tenderId;
    }
    
    const report = await this.tenderModel.aggregate([
      { $match: matchConditions },
      {
        $lookup: {
          from: 'guards',
          localField: '_id',
          foreignField: 'assignedTender',
          as: 'deployedGuards',
        },
      },
      {
        $project: {
          tenderName: 1,
          siteAddress: 1,
          ownerCompanyName: 1,
          requiredGuards: 1,
          deployedCount: { $size: '$deployedGuards' },
          guards: {
            $map: {
              input: '$deployedGuards',
              as: 'guard',
              in: {
                name: '$$guard.fullName',
                guardId: '$$guard.guardId',
                mobileNumber: '$$guard.mobileNumber',
              },
            },
          },
        },
      },
    ]);
    
    return report;
  }

  async getMonthlySalarySummary(month: number, year: number, groupBy?: string): Promise<any> {
    const matchConditions = { month, year };
    
    let report = await this.salaryModel.aggregate([
      { $match: matchConditions },
      {
        $lookup: {
          from: 'guards',
          localField: 'guard',
          foreignField: '_id',
          as: 'guardInfo',
        },
      },
      { $unwind: '$guardInfo' },
      {
        $group: {
          _id: groupBy === 'tender' ? '$guardInfo.assignedTender' : null,
          totalGrossSalary: { $sum: '$grossSalary' },
          totalNetSalary: { $sum: '$netSalary' },
          totalEsiDeduction: { $sum: '$esiDeduction' },
          totalPfDeduction: { $sum: '$pfDeduction' },
          count: { $sum: 1 },
        },
      },
    ]);
    
    return report;
  }

  async getAbsenteeismReport(month?: number, year?: number, threshold: number = 5): Promise<any> {
    const matchConditions: any = { status: 'absent' };
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      matchConditions.date = { $gte: startDate, $lte: endDate };
    }
    
    const report = await this.attendanceModel.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: '$guard',
          absentDays: { $sum: 1 },
        },
      },
      { $match: { absentDays: { $gte: threshold } } },
      {
        $lookup: {
          from: 'guards',
          localField: '_id',
          foreignField: '_id',
          as: 'guardInfo',
        },
      },
      { $unwind: '$guardInfo' },
      {
        $project: {
          guardName: '$guardInfo.fullName',
          guardId: '$guardInfo.guardId',
          absentDays: 1,
        },
      },
      { $sort: { absentDays: -1 } },
    ]);
    
    return report;
  }

  async getContractExpiryReport(daysThreshold: number = 30): Promise<any> {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + daysThreshold);
    
    const report = await this.tenderModel.find({
      status: 'active',
      contractEndDate: { $lte: expiryDate, $gte: new Date() },
    }).sort({ contractEndDate: 1 }).exec();
    
    return report;
  }

  // FIXED: Proper Buffer handling for Excel export
  async exportToExcel(queryDto: ReportQueryDto): Promise<Buffer> {
    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance Report');
    
    // Style the header row
    worksheet.getRow(1).font = { bold: true, size: 12 };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4CAF50' }
    };
    
    // Add headers
    worksheet.columns = [
      { header: 'Guard Name', key: 'guardName', width: 30 },
      { header: 'Guard ID', key: 'guardId', width: 15 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Shift Type', key: 'shiftType', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Tender', key: 'tender', width: 30 },
    ];
    
    // Build query conditions
    const matchConditions: any = {};
    if (queryDto.guardId) {
      matchConditions.guard = queryDto.guardId;
    }
    if (queryDto.tenderId) {
      matchConditions.tender = queryDto.tenderId;
    }
    if (queryDto.startDate || queryDto.endDate) {
      matchConditions.date = {};
      if (queryDto.startDate) matchConditions.date.$gte = new Date(queryDto.startDate);
      if (queryDto.endDate) matchConditions.date.$lte = new Date(queryDto.endDate);
    }
    
    // Fetch data with pagination
    const query = this.attendanceModel.find(matchConditions)
      .populate('guard', 'fullName guardId')
      .populate('tender', 'tenderName')
      .sort({ date: -1 })
      .limit(5000); // Limit to 5000 records for performance
    
    const attendances = await query.exec();
    
    // Add rows with proper data validation
    for (const attendance of attendances) {
      const guard = attendance.guard as any;
      const tender = attendance.tender as any;
      
      worksheet.addRow({
        guardName: guard?.fullName || 'N/A',
        guardId: guard?.guardId || 'N/A',
        date: attendance.date ? attendance.date.toISOString().split('T')[0] : 'N/A',
        shiftType: attendance.shiftType || 'N/A',
        status: attendance.status || 'N/A',
        tender: tender?.tenderName || 'N/A',
      });
    }
    
    // Add summary row
    worksheet.addRow({});
    worksheet.addRow({
      guardName: 'TOTAL RECORDS',
      guardId: attendances.length.toString(),
    });
    
    // Style the summary row
    const lastRow = worksheet.lastRow;
    if (lastRow) {
      lastRow.font = { bold: true };
      lastRow.getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
    }
    
    // Generate buffer - FIXED: Proper Buffer handling
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Return as Buffer (Node.js Buffer type)
    return Buffer.from(buffer);
  }

  // Alternative: Export to CSV format
  async exportToCsv(queryDto: ReportQueryDto): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance Report');
    
    // Same logic as above but save as CSV
    worksheet.columns = [
      { header: 'Guard Name', key: 'guardName', width: 30 },
      { header: 'Guard ID', key: 'guardId', width: 15 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Shift Type', key: 'shiftType', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Tender', key: 'tender', width: 30 },
    ];
    
    const matchConditions: any = {};
    if (queryDto.guardId) matchConditions.guard = queryDto.guardId;
    if (queryDto.tenderId) matchConditions.tender = queryDto.tenderId;
    
    const attendances = await this.attendanceModel.find(matchConditions)
      .populate('guard', 'fullName guardId')
      .populate('tender', 'tenderName')
      .limit(5000)
      .exec();
    
    for (const attendance of attendances) {
      const guard = attendance.guard as any;
      const tender = attendance.tender as any;
      
      worksheet.addRow({
        guardName: guard?.fullName || 'N/A',
        guardId: guard?.guardId || 'N/A',
        date: attendance.date ? attendance.date.toISOString().split('T')[0] : 'N/A',
        shiftType: attendance.shiftType || 'N/A',
        status: attendance.status || 'N/A',
        tender: tender?.tenderName || 'N/A',
      });
    }
    
    // Write as CSV buffer
    const csvBuffer = await workbook.csv.writeBuffer();
    return Buffer.from(csvBuffer);
  }
}