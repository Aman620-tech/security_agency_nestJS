import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../../../common/constants';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, unique: true })
  mobileNumber: string;

  @Prop({ enum: UserRole, required: true, default: UserRole.SUPERVISOR })
  role: UserRole;

  @Prop()
  zoneName?: string; // Only for supervisors

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastLoginAt: Date;

  @Prop()
  profileImage?: string;

  @Prop({ type: Object, default: {} })
  permissions: {
    canCreateGuard?: boolean;
    canEditGuard?: boolean;
    canDeleteGuard?: boolean;
    canCreateTender?: boolean;
    canEditTender?: boolean;
    canDeleteTender?: boolean;
    canMarkAttendance?: boolean;
    canGenerateReports?: boolean;
    canManageUsers?: boolean;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });