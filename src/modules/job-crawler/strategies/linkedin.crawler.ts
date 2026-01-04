import { Injectable, Logger } from '@nestjs/common';
import { JobCrawlerStrategy, NormalizedJobData } from '../interfaces/job-crawler.interface';
import { JobsService } from '../../jobs/jobs.service';

@Injectable()
export class LinkedInCrawler implements JobCrawlerStrategy {
    name = 'LinkedIn';
    private readonly logger = new Logger(LinkedInCrawler.name);

    constructor(private readonly jobsService: JobsService) { }

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
            }
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

    private normalizeJobData(raw: any): NormalizedJobData {
        let min = 0;
        let max = 0;
        let currency = 'VND';
        let level = 'Entry';
        let type = 'Full-time';

        if (raw.salaryRaw.includes('USD')) {
            currency = 'USD';
            const parts = raw.salaryRaw.match(/\d+/g);
            if (parts) {
                min = parseInt(parts[0]);
                max = parseInt(parts[1] || parts[0]);
            }
        }

        if (raw.title.toLowerCase().includes('senior')) level = 'Senior';

        return {
            externalId: raw.externalId,
            title: raw.title,
            company: raw.company,
            location: raw.location,
            salaryMin: min,
            salaryMax: max,
            currency,
            experienceLevel: level,
            jobType: type,
            salary: raw.salaryRaw,
            source: raw.source,
            url: raw.url,
            description: raw.description,
            skills: ['Mock Skill'],
        };
    }
}
