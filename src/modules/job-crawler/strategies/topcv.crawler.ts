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

    async crawlSpecificUrl(url: string) {
        try {
            this.logger.log(`Crawling specific TopCV URL: ${url}`);
            const detailData = await this.fetchTopCVDetail(url);

            // For testing, just log or return details
            // In real usage, you'd save it
            console.log('Crawled Data:', detailData);

            // Also try to save to DB to verify Entity
            const externalId = `topcv-${url.match(/\/(\d+)(\?|$)/)?.[1] || Date.now()}`;
            const jobData = this.normalizeJobData({
                externalId,
                title: 'DEBUG TITLE', // Title is usually on list page, here we mock or extract from detail if possible
                company: 'DEBUG COMPANY',
                location: 'DEBUG LOCATION',
                salaryRaw: '15 - 30 triệu', // Mocking for now as it's from list page usually
                source: 'topcv',
                url,
                ...detailData
            });

            await this.jobsService.create(jobData);
            this.logger.log('Saved specific job to DB');

        } catch (error) {
            this.logger.error('Failed to crawl specific URL', error);
        }
    }

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

        const findGeneralInfo = (labelKey: string) => {
            let value = '';
            $('.box-general-group-info').each((_, el) => {
                // Try new layout first
                const items = $(el).find('.box-main');
                items.each((_, item) => {
                    const label = $(item).find('.box-main-title').text();
                    if (label.includes(labelKey)) {
                        value = $(item).find('.box-main-text').text().trim();
                    }
                });
            });

            if (!value) {
                // Fallback to old layout
                $('.box-general-item').each((_, el) => {
                    const label = $(el).find('.box-general-item__title').text().trim();
                    if (label.includes(labelKey)) {
                        value = $(el).find('.box-general-item__value').text().trim();
                    }
                });
            }
            return value;
        };

        const jobType = findGeneralInfo('Hình thức làm việc');
        const level = findGeneralInfo('Cấp bậc');
        const gender = findGeneralInfo('Giới tính');
        const quantityRaw = findGeneralInfo('Số lượng tuyển');
        const quantity = quantityRaw ? parseInt(quantityRaw.match(/\d+/)?.[0] || '0') : 0;
        const experienceLevel = findGeneralInfo('Kinh nghiệm');

        // Deadline
        let deadline: Date | null = null;
        const deadlineText = $('.job-detail__info--deadline').text().replace('Hạn nộp hồ sơ:', '').trim();
        if (deadlineText) {
            // Basic parsing assumption for dd/mm/yyyy
            const parts = deadlineText.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
            if (parts) {
                deadline = new Date(`${parts[3]}-${parts[2]}-${parts[1]}`);
            }
        }

        // Logo & Company Info
        const logoUrl = $('.company-logo img').attr('src') || $('.box-company-logo img').attr('src');
        const companyAddress = $('.company-address').text().trim() || $('.box-company-address').text().trim();
        const companySize = $('.company-size').text().trim();

        return {
            description,
            requirements,
            benefits,
            jobType,
            experienceLevel,
            level,
            gender,
            quantity,
            deadline,
            logoUrl,
            companyAddress,
            companySize,
        };
    }

    private normalizeJobData(raw: any): any {
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
            description: raw.description, // HTML content
            requirements: raw.requirements,
            benefits: raw.benefits,
            jobType: raw.jobType || 'Full-time',
            experienceLevel: raw.experienceLevel || 'Not specified',
            level: raw.level,
            gender: raw.gender,
            quantity: raw.quantity,
            deadline: raw.deadline,
            logoUrl: raw.logoUrl,
            companyAddress: raw.companyAddress,
            companySize: raw.companySize,
            source: raw.source,
            url: raw.url,
            skills: [],
            postedAt: new Date(), // Appx
            originalData: raw, // Save full data just in case
        };
    }
}
