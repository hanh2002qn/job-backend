import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { Profile } from './entities/profile.entity';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { FileUploadModule } from '../../common/services/file-upload.module';
import { AIModule } from '../ai/ai.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Profile]),
    MulterModule.register({
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
    FileUploadModule,
    AIModule,
    UsersModule,
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
