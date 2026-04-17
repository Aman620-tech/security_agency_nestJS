import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GuardController } from './guard.controller';
import { GuardService } from './guard.service';
import { Guard, GuardSchema } from './schemas/guard.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Guard.name, schema: GuardSchema }]),
  ],
  controllers: [GuardController],
  providers: [GuardService],
  exports: [GuardService],
})
export class GuardModule {}