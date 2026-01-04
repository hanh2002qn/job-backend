import { Injectable, Logger } from '@nestjs/common';
import { JobCrawlerStrategy, NormalizedJobData } from '../interfaces/job-crawler.interface';
import { JobsService } from '../../jobs/jobs.service';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class TopCvCrawler implements JobCrawlerStrategy {
    name = 'TopCV';
    private readonly logger = new Logger(TopCvCrawler.name);

    constructor(private readonly jobsService: JobsService) { }

    async crawl(): Promise<void> {
        this.logger.log('Crawling TopCV...');
        const baseUrl = 'https://www.topcv.vn/viec-lam-it';

        try {
            const response = await axios.get(baseUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });

            const $ = cheerio.load(response.data);
            const jobItems = $('.job-item-2, .job-item-default');

            this.logger.log(`Found ${jobItems.length} jobs on TopCV list page.`);

            for (let i = 0; i < jobItems.length; i++) {
                const el = jobItems[i];
                const titleElement = $(el).find('.title a span').first();
                const linkElement = $(el).find('.title a').first();
                const companyElement = $(el).find('.company a').first();
                const salaryElement = $(el).find('.title-salary').first();
                const locationElement = $(el).find('.address').first();

                const title = titleElement.text().trim();
                const url = linkElement.attr('href');
                const company = companyElement.text().trim();
                const salaryRaw = salaryElement.text().trim();
                const location = locationElement.text().trim();

                if (url && title) {
                    const idMatch = url.match(/\/(\d+)(\?|$)/);
                    const externalId = idMatch ? `topcv-${idMatch[1]}` : `topcv-${url}`;

                    const existing = await this.jobsService.findByExternalId(externalId);
                    if (!existing) {
                        try {
                            const detailData = await this.fetchTopCVDetail(url);

                            const jobData = this.normalizeJobData({
                                externalId,
                                title,
                                company,
                                location,
                                salaryRaw,
                                source: 'topcv',
                                url,
                                ...detailData
                            });

                            await this.jobsService.create(jobData);
                            this.logger.log(`Imported job: ${title} from TopCV`);

                            await new Promise(r => setTimeout(r, 1000));
                        } catch (err) {
                            this.logger.error(`Failed to fetch details for ${url}`, err.message);
                        }
                    }
                }
            }
        } catch (error) {
            this.logger.error('Failed to fetch TopCV list page', error);
        }
    }

    private async fetchTopCVDetail(url: string) {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const $ = cheerio.load(response.data);

        let description = '';
        let requirements = '';
        let benefits = '';

        $('.job-description__item').each((_, el) => {
            const title = $(el).find('h3').text().trim();
            const content = $(el).find('.job-description__item-content').html();

            if (title.includes('Mô tả công việc')) {
                description = content || '';
            } else if (title.includes('Yêu cầu ứng viên')) {
                requirements = content || '';
            } else if (title.includes('Quyền lợi')) {
                benefits = content || '';
            }
        });

        const fullDescription = `
            <h3>Mô tả công việc</h3>
            ${description}
            <h3>Yêu cầu ứng viên</h3>
            ${requirements}
            <h3>Quyền lợi</h3>
            ${benefits}
        `;

        const findGeneralInfo = (labelKey: string) => {
            let value = '';
            $('.box-general-item').each((_, el) => {
                const label = $(el).find('.box-general-item__title').text().trim();
                if (label.includes(labelKey)) {
                    value = $(el).find('.box-general-item__value').text().trim();
                }
            });
            return value;
        };

        const jobType = findGeneralInfo('Hình thức làm việc');
        const experienceLevel = findGeneralInfo('Cấp bậc');

        return {
            description: fullDescription,
            jobType,
            experienceLevel,
        };
    }

    private normalizeJobData(raw: any): NormalizedJobData {
        let min = 0;
        let max = 0;
        let currency = 'VND';

        const salaryLower = raw.salaryRaw.toLowerCase();

        if (salaryLower.includes('usd') || salaryLower.includes('$')) {
            currency = 'USD';
        }

        const numbers = raw.salaryRaw.match(/[\d,.]+/g);
        if (numbers) {
            const parsedNumbers = numbers.map(n => parseFloat(n.replace(/,/g, '')));

            if (parsedNumbers.length === 2) {
                min = parsedNumbers[0];
                max = parsedNumbers[1];
            } else if (parsedNumbers.length === 1) {
                if (salaryLower.includes('trên') || salaryLower.includes('>')) {
                    min = parsedNumbers[0];
                } else if (salaryLower.includes('tới') || salaryLower.includes('up to')) {
                    max = parsedNumbers[0];
                } else {
                    min = parsedNumbers[0];
                }
            }
        }

        if (currency === 'VND') {
            if (salaryLower.includes('triệu')) {
                if (min > 0 && min < 1000) min *= 1000000;
                if (max > 0 && max < 1000) max *= 1000000;
            }
        }

        return {
            externalId: raw.externalId,
            title: raw.title,
            company: raw.company,
            location: raw.location,
            salaryMin: min,
            salaryMax: max,
            currency,
            salary: raw.salaryRaw,
            description: raw.description,
            jobType: raw.jobType || 'Full-time',
            experienceLevel: raw.experienceLevel || 'Not specified',
            source: raw.source,
            url: raw.url,
            skills: [],
        };
    }
}
