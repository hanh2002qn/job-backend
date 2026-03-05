import { Injectable } from '@nestjs/common';
import { DataSource, Like } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { User } from './entities/user.entity';
import { BaseSearchDto } from '../../common/dto/base-search.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return this.findOne({ where: { verificationToken: token } });
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.findOne({ where: { resetPasswordToken: token } });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.findOne({ where: { googleId } });
  }

  async findByGithubId(githubId: string): Promise<User | null> {
    return this.findOne({ where: { githubId } });
  }

  async findByAppleId(appleId: string): Promise<User | null> {
    return this.findOne({ where: { appleId } });
  }

  async findAllPaginated(searchDto: BaseSearchDto): Promise<PaginatedResponseDto<User>> {
    const { page = 1, limit = 10, search } = searchDto;
    return this.paginate({
      page,
      limit,
      where: search ? { email: Like(`%${search}%`) } : {},
      order: { createdAt: 'DESC' },
    });
  }
}
