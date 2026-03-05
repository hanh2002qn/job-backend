import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditLogRepository extends BaseRepository<AuditLog> {
  constructor(dataSource: DataSource) {
    super(AuditLog, dataSource.createEntityManager());
  }

  async findByUserId(userId: string): Promise<AuditLog[]> {
    return this.find({ where: { userId } });
  }

  async findByModule(module: string): Promise<AuditLog[]> {
    return this.find({ where: { module } });
  }
}
