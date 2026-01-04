import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JobsService } from '../jobs/jobs.service';

@Injectable()
export class JobCrawlerService {
    private readonly logger = new Logger(JobCrawlerService.name);

    constructor(private readonly jobsService: JobsService) { }

    @Cron(CronExpression.EVERY_HOUR)
    async handleCron() {
        this.logger.log('Starting job crawl...');
        // Implementation for crawling Logic
        // For now, we will mock adding a job if not exists

        // Example Mock Data
        const mockJobs = [
            {
                externalId: 'mock-1',
                title: 'Senior NestJS Developer',
                company: 'Tech Corp',
                location: 'Ho Chi Minh',
                salary: '2000-3000 USD',
                description: 'We are looking for a NestJS expert...',
                source: 'linkedin',
                skills: ['NestJS', 'TypeScript', 'PostgreSQL'],
            }
        ];

        for (const jobData of mockJobs) {
            const existing = await this.jobsService.findByExternalId(jobData.externalId);
            if (!existing) {
                await this.jobsService.create(jobData);
                this.logger.log(`Imported job: ${jobData.title}`);
            }
        }

        this.logger.log('Job crawl finished.');
    }
}
