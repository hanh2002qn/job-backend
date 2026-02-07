import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './entities/feedback.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
  ) {}

  async create(
    content: string,
    category?: string,
    rating?: number,
    user?: User,
    contactEmail?: string,
  ) {
    const feedback = this.feedbackRepository.create({
      content,
      category,
      rating,
      user,
      userId: user?.id,
      contactEmail: contactEmail || user?.email,
    });
    return this.feedbackRepository.save(feedback);
  }

  async findAll() {
    return this.feedbackRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  async markAsResolved(id: string) {
    await this.feedbackRepository.update(id, { isResolved: true });
    return this.feedbackRepository.findOne({ where: { id } });
  }
}
