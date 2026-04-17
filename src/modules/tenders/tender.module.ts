import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TenderController } from './tender.controller';
import { TenderService } from './tender.service';
import { Tender, TenderSchema } from './schemas/tender.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tender.name, schema: TenderSchema }]),
  ],
  controllers: [TenderController],
  providers: [TenderService],
  exports: [TenderService],
})
export class TenderModule {}