import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  /** Public: anyone can submit a review */
  async create(createReviewDto: CreateReviewDto): Promise<ReviewDocument> {
    const review = new this.reviewModel(createReviewDto);
    return review.save();
  }

  /** Public: returns only reviews that are visible and not soft-deleted */
  async findVisible(): Promise<ReviewDocument[]> {
    return this.reviewModel
      .find({ is_deleted: false, is_show: true })
      .select('-email -is_deleted -is_show -_id')
      .sort({ createdAt: -1 })
      .exec();
  }

  /** Admin: returns all reviews regardless of flags */
  async findAll(): Promise<ReviewDocument[]> {
    return this.reviewModel.find().sort({ createdAt: -1 }).exec();
  }

  /** Admin: toggle is_show or soft-delete a review */
  async update(id: string, updateReviewDto: UpdateReviewDto): Promise<ReviewDocument> {
    const review = await this.reviewModel.findByIdAndUpdate(
      id,
      { $set: updateReviewDto },
      { new: true },
    );
    if (!review) throw new NotFoundException(`Review #${id} not found`);
    return review;
  }

  /** Admin: hard delete */
  async remove(id: string): Promise<{ message: string }> {
    const result = await this.reviewModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException(`Review #${id} not found`);
    return { message: 'Review deleted successfully' };
  }
}