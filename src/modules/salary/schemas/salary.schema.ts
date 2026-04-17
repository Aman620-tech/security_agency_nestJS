import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type SalaryDocument = Salary & Document;

@Schema({ timestamps: true })
export class Salary {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Guard', required: true })
  guard: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  month: number;

  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  basicSalary: number;

  @Prop({ required: true })
  perDayRate: number;

  @Prop({ required: true })
  daysPresent: number;

  @Prop({ required: true })
  earnedBasic: number;

  @Prop({ required: true })
  nightShifts: number;

  @Prop({ required: true })
  nightAllowance: number;

  @Prop({ required: true })
  extraDutyDays: number;

  @Prop({ required: true })
  extraDutyPay: number;

  @Prop({ required: true })
  grossSalary: number;

  @Prop({ required: true })
  esiDeduction: number;

  @Prop({ required: true })
  pfDeduction: number;

  @Prop({ required: true })
  totalDeductions: number;

  @Prop({ required: true })
  netSalary: number;

  @Prop({ default: false })
  isLocked: boolean;

  @Prop()
  lockedAt: Date;

  @Prop()
  lockedBy: string;
}

export const SalarySchema = SchemaFactory.createForClass(Salary);

SalarySchema.index({ guard: 1, month: 1, year: 1 }, { unique: true });