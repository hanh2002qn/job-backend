import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DeepPartial } from 'typeorm';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';
import { UserSearchDto } from './dto/user-search.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';

export interface OAuthUserData {
  email: string;
  isEmailVerified: boolean;
  googleId?: string;
  githubId?: string;
  appleId?: string;
  avatarUrl?: string;
  fullName?: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(userData: Partial<User>): Promise<User> {
    return this.usersRepository.createAndSave(userData as DeepPartial<User>);
  }

  async findAll(searchDto: UserSearchDto): Promise<PaginatedResponseDto<User>> {
    return this.usersRepository.findAllPaginated(searchDto);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findOneById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  async findOneByVerificationToken(token: string): Promise<User | null> {
    return this.usersRepository.findByVerificationToken(token);
  }

  async findOneByResetToken(token: string): Promise<User | null> {
    return this.usersRepository.findByResetToken(token);
  }

  async update(id: string, updateData: DeepPartial<User>): Promise<void> {
    await this.usersRepository.updateById(id, updateData);
  }

  async delete(id: string): Promise<void> {
    await this.usersRepository.deleteById(id);
  }

  // OAuth methods
  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.usersRepository.findByGoogleId(googleId);
  }

  async findByGithubId(githubId: string): Promise<User | null> {
    return this.usersRepository.findByGithubId(githubId);
  }

  async findByAppleId(appleId: string): Promise<User | null> {
    return this.usersRepository.findByAppleId(appleId);
  }

  async findOrCreateOAuthUser(oauthData: OAuthUserData): Promise<User> {
    // 1. Try to find by OAuth provider ID
    if (oauthData.googleId) {
      const existing = await this.usersRepository.findByGoogleId(oauthData.googleId);
      if (existing) return existing;
    }

    if (oauthData.githubId) {
      const existing = await this.usersRepository.findByGithubId(oauthData.githubId);
      if (existing) return existing;
    }

    if (oauthData.appleId) {
      const existing = await this.usersRepository.findByAppleId(oauthData.appleId);
      if (existing) return existing;
    }

    // 2. Try to find by email and link the account
    const existingByEmail = await this.usersRepository.findByEmail(oauthData.email);
    if (existingByEmail) {
      if (!oauthData.isEmailVerified) {
        throw new UnauthorizedException(
          'Please verify your email with the provider before linking to an existing account.',
        );
      }

      if (oauthData.googleId) existingByEmail.googleId = oauthData.googleId;
      if (oauthData.githubId) existingByEmail.githubId = oauthData.githubId;
      if (oauthData.appleId) existingByEmail.appleId = oauthData.appleId;
      if (oauthData.avatarUrl && !existingByEmail.avatarUrl) {
        existingByEmail.avatarUrl = oauthData.avatarUrl;
      }
      return this.usersRepository.save(existingByEmail);
    }

    // 3. Create new user
    return this.usersRepository.createAndSave({
      email: oauthData.email,
      googleId: oauthData.googleId,
      githubId: oauthData.githubId,
      appleId: oauthData.appleId,
      avatarUrl: oauthData.avatarUrl,
      isVerified: true,
      passwordHash: null,
    });
  }
}
