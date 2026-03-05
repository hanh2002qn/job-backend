import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { createPaginationMeta } from '../../common/utils/pagination.util';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async createLog(data: Partial<AuditLog>): Promise<AuditLog> {
    const log = this.auditLogRepository.create(data);
    return this.auditLogRepository.save(log);
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    userId?: string;
    action?: string;
    module?: string;
    status?: string;
  }) {
    const { page = 1, limit = 20, userId, action, module, status } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.auditLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .select(['log', 'user.id', 'user.email', 'user.role'])
      .orderBy('log.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (userId) {
      queryBuilder.andWhere('log.userId = :userId', { userId });
    }

    if (action) {
      queryBuilder.andWhere('log.action = :action', { action });
    }

    if (module) {
      queryBuilder.andWhere('log.module = :module', { module });
    }

    if (status) {
      queryBuilder.andWhere('log.status = :status', { status });
    }

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      meta: createPaginationMeta(total, page, limit),
    };
  }
}
