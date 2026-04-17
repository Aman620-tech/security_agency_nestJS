import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Supervisor, SupervisorDocument } from './schemas/supervisor.schema';
import { CreateSupervisorDto } from './dto/create-supervisor.dto';
import { UpdateSupervisorDto } from './dto/update-supervisor.dto';

@Injectable()
export class SupervisorService {
  constructor(
    @InjectModel(Supervisor.name) private supervisorModel: Model<SupervisorDocument>,
    private configService: ConfigService,
  ) {}

  async create(createSupervisorDto: CreateSupervisorDto): Promise<SupervisorDocument> {
    // Check for duplicate username
    const existingSupervisor = await this.supervisorModel.findOne({
      username: createSupervisorDto.username,
    }).exec();
    
    if (existingSupervisor) {
      throw new ConflictException('Username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      createSupervisorDto.password,
      this.configService.get<number>('bcryptRounds'),
    );

    const supervisor = new this.supervisorModel({
      ...createSupervisorDto,
      password: hashedPassword,
    });
    
    return supervisor.save();
  }

  async findAll(): Promise<SupervisorDocument[]> {
    return this.supervisorModel.find().exec();
  }

  async findOne(id: string): Promise<SupervisorDocument> {
    const supervisor = await this.supervisorModel.findById(id).exec();
    if (!supervisor) {
      throw new NotFoundException(`Supervisor with ID ${id} not found`);
    }
    return supervisor;
  }

  async findByUsername(username: string): Promise<SupervisorDocument> {
    return this.supervisorModel.findOne({ username }).exec();
  }

  async update(id: string, updateSupervisorDto: UpdateSupervisorDto): Promise<SupervisorDocument> {
    if (updateSupervisorDto.password) {
      updateSupervisorDto.password = await bcrypt.hash(
        updateSupervisorDto.password,
        this.configService.get<number>('bcryptRounds'),
      );
    }

    const supervisor = await this.supervisorModel.findByIdAndUpdate(
      id,
      updateSupervisorDto,
      { new: true, runValidators: true }
    ).exec();
    
    if (!supervisor) {
      throw new NotFoundException(`Supervisor with ID ${id} not found`);
    }
    
    return supervisor;
  }

  async delete(id: string): Promise<void> {
    const result = await this.supervisorModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Supervisor with ID ${id} not found`);
    }
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}