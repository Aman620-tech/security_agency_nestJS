import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';

import configuration from './config/configuration';

import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/users/user.module';
import { GuardModule } from './modules/guards/guard.module';
import { TenderModule } from './modules/tenders/tender.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { SalaryModule } from './modules/salary/salary.module';
import { ReportModule } from './modules/reports/report.module';

@Module({
  imports: [
    // ✅ Load env + configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // ✅ MongoDB connection (cleaned)
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('mongodbUri');

        console.log('Mongo URI:', uri); // 🔍 debug once

        return {
          uri,
        };
      },
    }),

    ScheduleModule.forRoot(),

    AuthModule,
    UserModule,
    GuardModule,
    TenderModule,
    AttendanceModule,
    SalaryModule,
    ReportModule,
  ],
})
export class AppModule {}