import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { User } from './entities/user.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

export interface OAuthUserData {
  email: string;
  googleId?: string;
  githubId?: string;
  appleId?: string;
  avatarUrl?: string;
  fullName?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create(userData);
    return this.usersRepository.save(newUser);
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [items, total] = await this.usersRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findOneById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findOneByVerificationToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { verificationToken: token },
    });
  }

  async findOneByResetToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { resetPasswordToken: token },
    });
  }

  async update(id: string, updateData: DeepPartial<User>) {
    return this.usersRepository.update(
      id,
      updateData as Parameters<typeof this.usersRepository.update>[1],
    );
  }

  // OAuth methods
  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { googleId } });
  }

  async findByGithubId(githubId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { githubId } });
  }

  async findByAppleId(appleId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { appleId } });
  }

  async findOrCreateOAuthUser(oauthData: OAuthUserData): Promise<User> {
    // 1. Try to find by OAuth provider ID
    if (oauthData.googleId) {
      const existingByGoogle = await this.findByGoogleId(oauthData.googleId);
      if (existingByGoogle) return existingByGoogle;
    }

    if (oauthData.githubId) {
      const existingByGithub = await this.findByGithubId(oauthData.githubId);
      if (existingByGithub) return existingByGithub;
    }

    if (oauthData.appleId) {
      const existingByApple = await this.findByAppleId(oauthData.appleId);
      if (existingByApple) return existingByApple;
    }

    // 2. Try to find by email and link the account
    const existingByEmail = await this.findOneByEmail(oauthData.email);
    if (existingByEmail) {
      // Link OAuth account to existing user
      if (oauthData.googleId) existingByEmail.googleId = oauthData.googleId;
      if (oauthData.githubId) existingByEmail.githubId = oauthData.githubId;
      if (oauthData.appleId) existingByEmail.appleId = oauthData.appleId;
      if (oauthData.avatarUrl && !existingByEmail.avatarUrl) {
        existingByEmail.avatarUrl = oauthData.avatarUrl;
      }
      return this.usersRepository.save(existingByEmail);
    }

    // 3. Create new user
    const newUser = this.usersRepository.create({
      email: oauthData.email,
      googleId: oauthData.googleId,
      githubId: oauthData.githubId,
      appleId: oauthData.appleId,
      avatarUrl: oauthData.avatarUrl,
      isVerified: true, // OAuth users are auto-verified
      passwordHash: null, // OAuth users don't have password
    });

    return this.usersRepository.save(newUser);
  }
}
