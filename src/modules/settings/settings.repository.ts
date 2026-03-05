import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { SystemSetting } from './entities/system-setting.entity';

@Injectable()
export class SettingsRepository extends BaseRepository<SystemSetting> {
  constructor(dataSource: DataSource) {
    super(SystemSetting, dataSource.createEntityManager());
  }

  async findByKey(key: string): Promise<SystemSetting | null> {
    return this.findOne({ where: { key } });
  }
}
