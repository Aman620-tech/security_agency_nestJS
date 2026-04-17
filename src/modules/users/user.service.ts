import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../../common/constants';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    // Check if username exists
    const existingUser = await this.userModel.findOne({
      $or: [
        { username: createUserDto.username },
        { email: createUserDto.email },
        { mobileNumber: createUserDto.mobileNumber }
      ]
    }).exec();

    if (existingUser) {
      throw new ConflictException('Username, email, or mobile number already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      this.configService.get<number>('bcryptRounds'),
    );

    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      isActive: createUserDto.isActive !== undefined ? createUserDto.isActive : true,
    });

    return user.save();
  }

  async findAll(filters?: { role?: UserRole; isActive?: boolean }): Promise<UserDocument[]> {
    const query: any = {};
    if (filters?.role) query.role = filters.role;
    if (filters?.isActive !== undefined) query.isActive = filters.isActive;
    
    return this.userModel.find(query).select('-password').exec();
  }

  async findOne(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({
      $or: [
        { username: username },
        { email: username }
      ]
    }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Handle password change
    if (updateUserDto.newPassword) {
      if (!updateUserDto.currentPassword) {
        throw new BadRequestException('Current password is required to change password');
      }
      
      const isPasswordValid = await bcrypt.compare(updateUserDto.currentPassword, user.password);
      if (!isPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
      }
      
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.newPassword,
        this.configService.get<number>('bcryptRounds'),
      );
      delete updateUserDto.currentPassword;
      delete updateUserDto.newPassword;
    }

    // Remove password from update if not changing
    if (updateUserDto.password && !updateUserDto.newPassword) {
      delete updateUserDto.password;
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      updateUserDto,
      { new: true, runValidators: true }
    ).select('-password').exec();

    return updatedUser;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { lastLoginAt: new Date() }).exec();
  }

  async delete(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async deactivate(id: string): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).select('-password').exec();
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async activate(id: string): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    ).select('-password').exec();
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async getUsersByRole(role: UserRole): Promise<UserDocument[]> {
    return this.userModel.find({ role, isActive: true }).select('-password').exec();
  }

  async getSupervisors(): Promise<UserDocument[]> {
    return this.getUsersByRole(UserRole.SUPERVISOR);
  }

  async getAdmins(): Promise<UserDocument[]> {
    return this.getUsersByRole(UserRole.ADMIN);
  }

  async getDirector(): Promise<UserDocument | null> {
    return this.userModel.findOne({ role: UserRole.DIRECTOR, isActive: true }).select('-password').exec();
  }
}