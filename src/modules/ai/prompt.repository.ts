import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { Prompt } from './entities/prompt.entity';

@Injectable()
export class PromptRepository extends BaseRepository<Prompt> {
  constructor(dataSource: DataSource) {
    super(Prompt, dataSource.createEntityManager());
  }

  async findByKey(key: string): Promise<Prompt | null> {
    return this.findOne({ where: { key } });
  }

  async findAllActive(): Promise<Prompt[]> {
    return this.find({ where: { isActive: true } });
  }
}
