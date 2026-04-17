import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { Guard, GuardSchema } from '../guards/schemas/guard.schema';
import { Tender, TenderSchema } from '../tenders/schemas/tender.schema';
import { Attendance, AttendanceSchema } from '../attendance/schemas/attendance.schema';
import { Salary, SalarySchema } from '../salary/schemas/salary.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Guard.name, schema: GuardSchema },
      { name: Tender.name, schema: TenderSchema },
      { name: Attendance.name, schema: AttendanceSchema },
      { name: Salary.name, schema: SalarySchema },
    ]),
  ],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}