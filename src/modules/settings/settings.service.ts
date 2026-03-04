import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from './entities/system-setting.entity';
import { UpdateSystemSettingDto } from './dto/update-system-setting.dto';

@Injectable()
export class SettingsService implements OnModuleInit {
  private settingsCache: Map<string, unknown> = new Map();

  constructor(
    @InjectRepository(SystemSetting)
    private readonly settingsRepository: Repository<SystemSetting>,
  ) {}

  async onModuleInit() {
    await this.seedDefaults();
    await this.loadAllToCache();
  }

  private async seedDefaults() {
    const defaults = [
      { key: 'maintenance_mode', value: false, description: 'Turn on/off system maintenance mode' },
      { key: 'site_title', value: 'AI-Job Platform', description: 'Global website title' },
      {
        key: 'job_auto_approve',
        value: true,
        description: 'Automatically approve jobs from trusted crawlers',
      },
      {
        key: 'llm_provider',
        value: 'gemini',
        description: 'Default AI Provider (gemini, openai, or groq)',
      },
    ];

    for (const d of defaults) {
      const exists = await this.settingsRepository.findOne({ where: { key: d.key } });
      if (!exists) {
        await this.settingsRepository.save(this.settingsRepository.create(d));
      }
    }
  }

  private async loadAllToCache() {
    const settings = await this.settingsRepository.find();
    settings.forEach((s) => {
      this.settingsCache.set(s.key, s.value);
    });
  }

  async findAll(): Promise<SystemSetting[]> {
    return this.settingsRepository.find();
  }

  async findOne(key: string): Promise<SystemSetting> {
    const setting = await this.settingsRepository.findOne({ where: { key } });
    if (!setting) {
      throw new NotFoundException(`Setting with key "${key}" not found`);
    }
    return setting;
  }

  async update(key: string, updateDto: UpdateSystemSettingDto): Promise<SystemSetting> {
    let setting = await this.settingsRepository.findOne({ where: { key } });

    if (!setting) {
      setting = this.settingsRepository.create({ key, ...updateDto });
    } else {
      Object.assign(setting, updateDto);
    }

    const saved = await this.settingsRepository.save(setting);
    this.settingsCache.set(key, saved.value);
    return saved;
  }

  getSettingFromCache<T>(key: string): T | undefined {
    return this.settingsCache.get(key) as T;
  }
}
