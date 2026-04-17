import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { GuardStatus } from '../../../common/constants';

export type GuardDocument = Guard & Document;

@Schema({ timestamps: true })
export class Guard {
  @Prop({ required: true })
  fullName: string;

  @Prop({ unique: true, required: true })
  guardId: string;

  @Prop({ required: true })
  mobileNumber: string;

  @Prop({ required: true })
  residentialAddress: string;

  @Prop({ required: true, unique: true })
  aadhaarNumber: string;

  @Prop({ required: true })
  dateOfJoining: Date;

  @Prop({ required: true, min: 0 })
  basicMonthlySalary: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Supervisor', required: true })
  assignedSupervisor: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Tender', required: true })
  assignedTender: MongooseSchema.Types.ObjectId;

  @Prop({ default: false })
  esiApplicable: boolean;

  @Prop({ default: false })
  pfApplicable: boolean;

  @Prop({ enum: GuardStatus, default: GuardStatus.ACTIVE })
  status: GuardStatus;
}

export const GuardSchema = SchemaFactory.createForClass(Guard);

// Indexes for performance
GuardSchema.index({ guardId: 1 });
GuardSchema.index({ fullName: 'text' });
GuardSchema.index({ assignedSupervisor: 1 });
GuardSchema.index({ assignedTender: 1 });
GuardSchema.index({ status: 1 });