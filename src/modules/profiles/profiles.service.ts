import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private profilesRepository: Repository<Profile>,
  ) {}

  async findByUserId(userId: string): Promise<Profile> {
    let profile = await this.profilesRepository.findOne({
      where: { userId },
      relations: ['user'],
    });
    if (!profile) {
      // Auto-create profile if not exists
      profile = this.profilesRepository.create({ userId });
      await this.profilesRepository.save(profile);
    }
    return profile;
  }

  async updateByUserId(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<Profile> {
    const profile = await this.findByUserId(userId);
    Object.assign(profile, updateProfileDto);
    return this.profilesRepository.save(profile);
  }
}
