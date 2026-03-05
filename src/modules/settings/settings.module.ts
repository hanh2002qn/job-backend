import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemSetting } from './entities/system-setting.entity';
import { SettingsService } from './settings.service';
import { SettingsRepository } from './settings.repository';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([SystemSetting])],
  providers: [SettingsService, SettingsRepository],
  exports: [SettingsService, SettingsRepository, TypeOrmModule],
})
export class SettingsModule {}
