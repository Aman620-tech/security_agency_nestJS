import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tender, TenderDocument } from './schemas/tender.schema';
import { CreateTenderDto } from './dto/create-tender.dto';
import { UpdateTenderDto } from './dto/update-tender.dto';
import { TenderStatus } from '../../common/constants';

@Injectable()
export class TenderService {
  constructor(
    @InjectModel(Tender.name) private tenderModel: Model<TenderDocument>,
  ) {}

  async create(createTenderDto: CreateTenderDto): Promise<TenderDocument> {
    const tender = new this.tenderModel(createTenderDto);
    return tender.save();
  }

  async findAll(status?: TenderStatus): Promise<TenderDocument[]> {
    const query = status ? { status } : {};
    return this.tenderModel.find(query).exec();
  }

  async findOne(id: string): Promise<TenderDocument> {
    const tender = await this.tenderModel.findById(id).exec();
    if (!tender) {
      throw new NotFoundException(`Tender with ID ${id} not found`);
    }
    return tender;
  }

  async update(id: string, updateTenderDto: UpdateTenderDto): Promise<TenderDocument> {
    const tender = await this.tenderModel.findByIdAndUpdate(
      id,
      updateTenderDto,
      { new: true, runValidators: true }
    ).exec();
    
    if (!tender) {
      throw new NotFoundException(`Tender with ID ${id} not found`);
    }
    
    return tender;
  }

  async closeTender(id: string): Promise<TenderDocument> {
    const tender = await this.tenderModel.findByIdAndUpdate(
      id,
      { status: TenderStatus.CLOSED },
      { new: true }
    ).exec();
    
    if (!tender) {
      throw new NotFoundException(`Tender with ID ${id} not found`);
    }
    
    return tender;
  }

  async getExpiringTenders(daysThreshold: number = 30): Promise<TenderDocument[]> {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + daysThreshold);
    
    return this.tenderModel.find({
      status: TenderStatus.ACTIVE,
      contractEndDate: { $lte: expiryDate, $gte: new Date() }
    }).exec();
  }

  async getActiveTenders(): Promise<TenderDocument[]> {
    return this.tenderModel.find({ status: TenderStatus.ACTIVE }).exec();
  }
}