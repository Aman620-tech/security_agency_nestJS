import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SupervisorDocument = Supervisor & Document;

@Schema({ timestamps: true })
export class Supervisor {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  mobileNumber: string;

  @Prop({ required: true })
  zoneName: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;
}

export const SupervisorSchema = SchemaFactory.createForClass(Supervisor);

SupervisorSchema.index({ username: 1 });
SupervisorSchema.index({ zoneName: 1 });