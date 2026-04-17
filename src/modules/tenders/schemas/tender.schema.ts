import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TenderStatus } from '../../../common/constants';

export type TenderDocument = Tender & Document;

@Schema({ timestamps: true })
export class Tender {
  @Prop({ required: true })
  tenderName: string;

  @Prop({ required: true })
  ownerName: string;

  @Prop({ required: true })
  ownerCompanyName: string;

  @Prop({ required: true })
  ownerContactNumber: string;

  @Prop()
  ownerEmail: string;

  @Prop({ required: true })
  siteAddress: string;

  @Prop({ required: true, min: 1 })
  requiredGuards: number;

  @Prop({ required: true })
  contractStartDate: Date;

  @Prop({ required: true })
  contractEndDate: Date;

  @Prop()
  monthlyContractValue: number;

  @Prop({ enum: TenderStatus, default: TenderStatus.ACTIVE })
  status: TenderStatus;
}

export const TenderSchema = SchemaFactory.createForClass(Tender);

TenderSchema.index({ status: 1 });
TenderSchema.index({ contractEndDate: 1 });
TenderSchema.index({ tenderName: 'text' });