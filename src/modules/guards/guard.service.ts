import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Guard, GuardDocument } from './schemas/guard.schema';
import { CreateGuardDto } from './dto/create-guard.dto';
import { UpdateGuardDto } from './dto/update-guard.dto';
import { QueryGuardDto } from './dto/query-guard.dto';
import { GuardStatus } from '../../common/constants';

@Injectable()
export class GuardService {
  constructor(
    @InjectModel(Guard.name) private guardModel: Model<GuardDocument>,
  ) {}

  async create(createGuardDto: CreateGuardDto): Promise<GuardDocument> {
    // Generate unique Guard ID
    const lastGuard = await this.guardModel.findOne().sort({ guardId: -1 }).exec();
    let nextId = 1;
    if (lastGuard && lastGuard.guardId) {
      const match = lastGuard.guardId.match(/SG-(\d+)/);
      if (match) nextId = parseInt(match[1]) + 1;
    }
    const guardId = `SG-${nextId.toString().padStart(3, '0')}`;

    // Check for duplicate Aadhaar
    const existingGuard = await this.guardModel.findOne({
      aadhaarNumber: createGuardDto.aadhaarNumber,
    }).exec();
    
    if (existingGuard) {
      throw new ConflictException('Guard with this Aadhaar number already exists');
    }

    const guard = new this.guardModel({
      ...createGuardDto,
      guardId,
    });
    
    return guard.save();
  }

  async findAll(queryDto: QueryGuardDto): Promise<GuardDocument[]> {
    const query: any = {};
    
    if (queryDto.status) {
      query.status = queryDto.status;
    }
    
    if (queryDto.supervisorId) {
      query.assignedSupervisor = queryDto.supervisorId;
    }
    
    if (queryDto.tenderId) {
      query.assignedTender = queryDto.tenderId;
    }
    
    let guardsQuery = this.guardModel.find(query)
      .populate('assignedSupervisor', 'fullName mobileNumber zoneName')
      .populate('assignedTender', 'tenderName siteAddress');
    
    if (queryDto.search) {
      guardsQuery = guardsQuery.find({
        $text: { $search: queryDto.search },
      });
    }
    
    return guardsQuery.exec();
  }

  async findOne(id: string): Promise<GuardDocument> {
    const guard = await this.guardModel.findById(id)
      .populate('assignedSupervisor')
      .populate('assignedTender')
      .exec();
    
    if (!guard) {
      throw new NotFoundException(`Guard with ID ${id} not found`);
    }
    
    return guard;
  }

  async findByGuardId(guardId: string): Promise<GuardDocument> {
    const guard = await this.guardModel.findOne({ guardId })
      .populate('assignedSupervisor')
      .populate('assignedTender')
      .exec();
    
    if (!guard) {
      throw new NotFoundException(`Guard with Guard ID ${guardId} not found`);
    }
    
    return guard;
  }

  async update(id: string, updateGuardDto: UpdateGuardDto): Promise<GuardDocument> {
    const guard = await this.guardModel.findByIdAndUpdate(
      id,
      updateGuardDto,
      { new: true, runValidators: true }
    ).exec();
    
    if (!guard) {
      throw new NotFoundException(`Guard with ID ${id} not found`);
    }
    
    return guard;
  }

  async deactivate(id: string): Promise<GuardDocument> {
    const guard = await this.guardModel.findByIdAndUpdate(
      id,
      { status: GuardStatus.INACTIVE },
      { new: true }
    ).exec();
    
    if (!guard) {
      throw new NotFoundException(`Guard with ID ${id} not found`);
    }
    
    return guard;
  }

  async getGuardsBySupervisor(supervisorId: string): Promise<GuardDocument[]> {
    return this.guardModel.find({ 
      assignedSupervisor: supervisorId,
      status: GuardStatus.ACTIVE 
    }).exec();
  }

  async getGuardsByTender(tenderId: string): Promise<GuardDocument[]> {
    return this.guardModel.find({ 
      assignedTender: tenderId,
      status: GuardStatus.ACTIVE 
    }).exec();
  }

  async getGuardCountBySupervisor(): Promise<any[]> {
    return this.guardModel.aggregate([
      { $match: { status: GuardStatus.ACTIVE } },
      {
        $group: {
          _id: '$assignedSupervisor',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'supervisors',
          localField: '_id',
          foreignField: '_id',
          as: 'supervisor'
        }
      },
      { $unwind: '$supervisor' },
      {
        $project: {
          supervisorName: '$supervisor.fullName',
          zoneName: '$supervisor.zoneName',
          count: 1
        }
      }
    ]);
  }
}