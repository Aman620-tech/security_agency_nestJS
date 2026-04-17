import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { Attendance, AttendanceSchema } from './schemas/attendance.schema';
import { GuardModule } from '../guards/guard.module';
import { TenderModule } from '../tenders/tender.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Attendance.name, schema: AttendanceSchema }]),
    GuardModule,
    TenderModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}