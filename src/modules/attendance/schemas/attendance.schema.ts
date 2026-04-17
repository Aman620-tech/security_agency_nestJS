import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ShiftType, AttendanceStatus } from '../../../common/constants';

export type AttendanceDocument = Attendance & Document;

@Schema({ timestamps: true })
export class Attendance {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Guard', required: true })
  guard: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Tender', required: true })
  tender: MongooseSchema.Types.ObjectId;

  @Prop({ enum: ShiftType, required: true })
  shiftType: ShiftType;

  @Prop({ enum: AttendanceStatus, required: true })
  status: AttendanceStatus;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);

// Compound index to prevent duplicate entries
AttendanceSchema.index({ guard: 1, date: 1, shiftType: 1 }, { unique: true });
AttendanceSchema.index({ guard: 1, date: 1 });
AttendanceSchema.index({ date: 1 });