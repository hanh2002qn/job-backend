import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateVisibilityDto } from './dto/visibility-settings.dto';
import { FileUploadService } from '../../common/services/file-upload.service';
import { UsersService } from '../users/users.service';
import { CvImportSession } from './entities/cv-import-session.entity';
import { CvImportSessionService } from './services/cv-import-session.service';

@Injectable()
export class ProfilesService {
  private readonly logger = new Logger(ProfilesService.name);

  constructor(
    @InjectRepository(Profile)
    private profilesRepository: Repository<Profile>,
    private fileUploadService: FileUploadService,
    private usersService: UsersService,
    private cvImportSessionService: CvImportSessionService,
  ) {}

  async findByUserId(userId: string): Promise<Profile | null> {
    return this.profilesRepository.findOne({
      where: { userId },
      relations: ['user'],
    });
  }

  async findPublicProfile(profileId: string): Promise<Partial<Profile> | null> {
    const profile = await this.profilesRepository.findOne({
      where: { id: profileId, isPublic: true },
      relations: ['user', 'profileSkills', 'profileExperiences', 'profileProjects'],
    });

    if (!profile) {
      return null;
    }

    // Apply visibility settings to filter sensitive data
    const { visibilitySettings } = profile;

    return {
      id: profile.id,
      fullName: profile.fullName,
      currentRole: profile.currentRole,
      seniorityLevel: profile.seniorityLevel,
      yearsOfExperience: profile.yearsOfExperience,
      location: profile.location,
      workPreference: profile.workPreference,
      // Conditional fields based on visibility settings
      ...(visibilitySettings.showSocials && {
        linkedin: profile.linkedin,
        portfolio: profile.portfolio,
      }),
      // Relations
      profileSkills: profile.profileSkills,
      profileExperiences: profile.profileExperiences,
      profileProjects: profile.profileProjects,
    };
  }

  async updateByUserId(userId: string, updateProfileDto: UpdateProfileDto): Promise<Profile> {
    let profile = await this.findByUserId(userId);
    if (!profile) {
      profile = this.profilesRepository.create({ userId });
    }
    Object.assign(profile, updateProfileDto);

    return this.profilesRepository.save(profile);
  }

  // ============ Feature 1: CV Upload + AI Parse ============

  async uploadCv(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ url: string; session?: CvImportSession; parseError?: string }> {
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only PDF, DOC, DOCX, and TXT files are allowed');
    }

    // Upload to S3
    const uploadResult = await this.fileUploadService.uploadFile(file, 'cvs');

    // Get or create profile
    let profile = await this.findByUserId(userId);
    if (!profile) {
      profile = this.profilesRepository.create({ userId });
      await this.profilesRepository.save(profile);
    }

    // Delete old CV if exists
    if (profile.cvS3Key) {
      await this.fileUploadService.deleteFile(profile.cvS3Key).catch(() => undefined);
    }

    // Update profile with CV info
    profile.cvUrl = uploadResult.url;
    profile.cvFileName = uploadResult.fileName;
    profile.cvS3Key = uploadResult.key;
    await this.profilesRepository.save(profile);

    // Create CV import session for user to review
    let session: CvImportSession | undefined;
    let parseError: string | undefined;
    try {
      const rawText = this.fileUploadService.extractTextFromFile(file);
      session = await this.cvImportSessionService.createFromText(profile.id, rawText);
    } catch (error) {
      // Session creation failed - CV is still uploaded successfully
      // User can manually add information later
      parseError = error instanceof Error ? error.message : 'CV parsing failed';
      this.logger.warn(`CV parsing failed for user ${userId}: ${parseError}`);
    }

    return {
      url: uploadResult.url,
      session,
      parseError,
    };
  }

  // ============ Feature 2: Avatar Upload ============

  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<{ url: string }> {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, WebP, and GIF images are allowed');
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('Image size must be less than 5MB');
    }

    // Upload to S3
    const uploadResult = await this.fileUploadService.uploadFile(file, 'avatars');

    // Update user avatarUrl
    await this.usersService.update(userId, { avatarUrl: uploadResult.url });

    return { url: uploadResult.url };
  }

  // ============ Feature 3: Visibility Settings ============

  async updateVisibility(userId: string, dto: UpdateVisibilityDto): Promise<Profile> {
    let profile = await this.findByUserId(userId);
    if (!profile) {
      profile = this.profilesRepository.create({ userId });
    }

    if (dto.isPublic !== undefined) {
      profile.isPublic = dto.isPublic;
    }

    if (dto.visibilitySettings) {
      profile.visibilitySettings = {
        ...profile.visibilitySettings,
        ...dto.visibilitySettings,
      };
    }

    return this.profilesRepository.save(profile);
  }
}
