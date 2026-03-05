import { Injectable } from '@nestjs/common';
import { DataSource, Like, FindOptionsWhere } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { User } from './entities/user.entity';
import { UserSearchDto, UserStatusFilter } from './dto/user-search.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findByIdWithProfile(id: string): Promise<User | null> {
    return this.findOne({
      where: { id } as FindOptionsWhere<User>,
      relations: ['profile'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } as FindOptionsWhere<User> });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        isVerified: true,
        role: true,
        isBanned: true,
      },
    });
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return this.findOne({ where: { verificationToken: token } });
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.findOne({ where: { resetPasswordToken: token } });
  }

  async findByResetTokenWithExpiry(token: string): Promise<User | null> {
    return this.findOne({
      where: { resetPasswordToken: token },
      select: {
        id: true,
        resetPasswordToken: true,
        resetPasswordExpires: true,
      },
    });
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

  async findAllPaginated(searchDto: UserSearchDto): Promise<PaginatedResponseDto<User>> {
    const { page = 1, limit = 10, search, role, status } = searchDto;
    const where: FindOptionsWhere<User> = {};

    if (search) {
      where.email = Like(`%${search}%`);
    }

    if (role) {
      where.role = role;
    }

    if (status) {
      where.isBanned = status === UserStatusFilter.BANNED;
    }

    return this.paginate({
      page,
      limit,
      where,
      order: { createdAt: 'DESC' },
    });
  }
}
