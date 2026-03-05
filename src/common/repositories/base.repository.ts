import { Repository, FindOptionsWhere, DeepPartial, FindManyOptions } from 'typeorm';
import { createPaginationMeta } from '../utils/pagination.util';
import { PaginatedResponseDto } from '../dto/pagination.dto';

export interface PaginateOptions<T> {
  page?: number;
  limit?: number;
  where?: FindOptionsWhere<T> | FindOptionsWhere<T>[];
  order?: FindManyOptions<T>['order'];
  relations?: FindManyOptions<T>['relations'];
}

export abstract class BaseRepository<T extends { id: string }> extends Repository<T> {
  async findById(id: string): Promise<T | null> {
    return this.findOne({ where: { id } as FindOptionsWhere<T> });
  }

  async createAndSave(data: DeepPartial<T>): Promise<T> {
    const entity = this.create(data);
    return this.save(entity);
  }

  async updateById(id: string, data: DeepPartial<T>): Promise<void> {
    await this.update(id, data as Parameters<typeof this.update>[1]);
  }

  async deleteById(id: string): Promise<void> {
    await this.delete(id);
  }

  async paginate(options: PaginateOptions<T>): Promise<PaginatedResponseDto<T>> {
    const { page = 1, limit = 10, where = {}, order = {}, relations } = options;

    const [data, total] = await this.findAndCount({
      where: where as FindOptionsWhere<T>,
      skip: (page - 1) * limit,
      take: limit,
      order,
      relations,
    });

    return { data, meta: createPaginationMeta(total, page, limit) };
  }
}
