import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true, trim: true })
  tenderName: string;

  @Prop({ required: true, trim: true })
  areaName: string;

  @Prop({ default: false })
  is_deleted: boolean;

  @Prop({ default: true })
  is_show: boolean;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);