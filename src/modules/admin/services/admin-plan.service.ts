import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from '../../subscription/entities/plan.entity';

@Injectable()
export class AdminPlanService {
  constructor(
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,
  ) {}

  async findAll() {
    return this.planRepository.find({ order: { price: 'ASC' } });
  }

  async findOne(id: string) {
    const plan = await this.planRepository.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }

  async update(id: string, updateData: Partial<Plan>) {
    const plan = await this.findOne(id);
    Object.assign(plan, updateData);
    return this.planRepository.save(plan);
  }

  async create(createData: Partial<Plan>) {
    const plan = this.planRepository.create(createData);
    return this.planRepository.save(plan);
  }
}
