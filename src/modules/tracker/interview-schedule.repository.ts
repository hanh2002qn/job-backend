import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { InterviewSchedule } from './entities/interview-schedule.entity';

@Injectable()
export class InterviewScheduleRepository extends BaseRepository<InterviewSchedule> {
  constructor(dataSource: DataSource) {
    super(InterviewSchedule, dataSource.createEntityManager());
  }

  async findByTrackerId(trackerId: string): Promise<InterviewSchedule[]> {
    return this.find({ where: { trackerId }, order: { scheduledAt: 'ASC' } });
  }
}
