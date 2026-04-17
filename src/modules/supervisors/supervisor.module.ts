import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SupervisorController } from './supervisor.controller';
import { SupervisorService } from './supervisor.service';
import { Supervisor, SupervisorSchema } from './schemas/supervisor.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Supervisor.name, schema: SupervisorSchema }]),
  ],
  controllers: [SupervisorController],
  providers: [SupervisorService],
  exports: [SupervisorService],
})
export class SupervisorModule {}