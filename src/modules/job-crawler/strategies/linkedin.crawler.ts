import { Injectable, Logger } from '@nestjs/common';
import {
  JobCrawlerStrategy,
  NormalizedJobData,
  RawLinkedInJob,
} from '../interfaces/job-crawler.interface';
import { JobsService } from '../../jobs/jobs.service';
import { JobNormalizationService } from '../services/job-normalization.service';

@Injectable()
export class LinkedInCrawler implements JobCrawlerStrategy {
  name = 'LinkedIn';
  private readonly logger = new Logger(LinkedInCrawler.name);

  constructor(
    private readonly jobsService: JobsService,
    private readonly normalizationService: JobNormalizationService,
  ) {}

  async crawl(): Promise<void> {
    this.logger.log('Crawling LinkedIn (Mock)...');
    // Mock Implementation
    const jobs = [
      {
        externalId: 'li-1',
        title: 'Senior NestJS Developer',
        company: 'Tech Corp',
        location: 'Ho Chi Minh',
        salaryRaw: '2000-3000 USD',
        description: 'We are looking for a NestJS expert...',
        source: 'linkedin',
        url: 'https://linkedin.com/jobs/view/1',
        postedAt: new Date(),
      },
    ];

    for (const raw of jobs) {
      const existing = await this.jobsService.findByExternalId(raw.externalId);
      if (!existing) {
        const normalized = this.normalizeJobData(raw);
        await this.jobsService.create(normalized);
        this.logger.log(`Imported job: ${normalized.title} from ${normalized.source}`);
      }
    }
  }

  private normalizeJobData(raw: RawLinkedInJob): NormalizedJobData {
    const salaryParsed = this.normalizationService.parseSalary(raw.salaryRaw);

    return {
      externalId: raw.externalId,
      title: raw.title,
      company: raw.company,
      location: raw.location,
      salaryMin: salaryParsed.min,
      salaryMax: salaryParsed.max,
      currency: salaryParsed.currency,
      salary: raw.salaryRaw || '',
      description: this.normalizationService.sanitizeHtml(raw.description),
      jobType: this.normalizationService.normalizeJobType('Full-time'),
      experienceLevel: this.normalizationService.normalizeExperienceLevel(raw.title),
      source: raw.source,
      url: raw.url,
      skills: ['Mock Skill'],
    };
  }
}
