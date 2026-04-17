import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SalaryController } from './salary.controller';
import { SalaryService } from './salary.service';
import { Salary, SalarySchema } from './schemas/salary.schema';
import { GuardModule } from '../guards/guard.module';
import { AttendanceModule } from '../attendance/attendance.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Salary.name, schema: SalarySchema }]),
    GuardModule,
    AttendanceModule,
  ],
  controllers: [SalaryController],
  providers: [SalaryService],
  exports: [SalaryService],
})
export class SalaryModule {}