import { Injectable, Logger } from '@nestjs/common';
import { JobCrawlerStrategy, RawTopCVJob } from '../interfaces/job-crawler.interface';
import { JobsService } from '../../jobs/jobs.service';
import { JobNormalizationService } from '../services/job-normalization.service';
import * as cheerio from 'cheerio';
import DOMPurify from 'isomorphic-dompurify';
import { chromium } from 'playwright-extra';
import type { Page } from 'playwright';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

chromium.use(StealthPlugin());

// Type guard for JSON-LD JobPosting
function isJobPosting(obj: unknown): obj is RawTopCVJob {
  if (typeof obj !== 'object' || obj === null) return false;
  const record = obj as Record<string, unknown>;
  return record['@type'] === 'JobPosting';
}

function parseJsonLd(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

interface TopCvDetailData {
  title: string;
  company: string;
  salaryRaw: string;
  description: string;
  requirements: string;
  benefits: string;
  jobType: string;
  experienceLevel: string;
  education: string;
  level: string;
  gender: string;
  quantity: number;
  deadline: Date | null;
  logoUrl: string | undefined;
  companyAddress: string;
  companySize: string;
  industry: string;
  allowance: string;
  equipment: string;
  workingTime: string;
  city: string;
  tags: string[];
  categories: string[];
  isBranded: boolean;
  isVerified: boolean;
  jsonLd: RawTopCVJob | null;
  source?: string;
  url?: string;
  externalId?: string;
  location?: string;
}

@Injectable()
export class TopCvCrawler implements JobCrawlerStrategy {
  name = 'TopCV';
  private readonly logger = new Logger(TopCvCrawler.name);

  constructor(
    private readonly jobsService: JobsService,
    private readonly normalizationService: JobNormalizationService,
  ) {}

  async crawlSpecificUrl(url: string) {
    const browser = await chromium.launch({ headless: true });
    try {
      const context = await browser.newContext();
      const page = await context.newPage();

      this.logger.log(`Crawling specific TopCV URL (Headless): ${url}`);
      const detailData = await this.fetchTopCVDetail(page, url);

      const idMatch = url.match(/[/-]j?(\d+)(\.html|\?|$)/);
      const externalId = idMatch ? `topcv-${idMatch[1]}` : `topcv-${url}`;
      const jobData = this.normalizeJobData({
        ...detailData,
        externalId,
        source: 'topcv',
        url,
        title: detailData.title || 'N/A',
        company: detailData.company || 'N/A',
        location: detailData.companyAddress || 'N/A',
        salaryRaw: detailData.salaryRaw || 'Thỏa thuận',
      });

      await this.jobsService.create(jobData);
      this.logger.log('Saved specific job to DB');
    } catch (error) {
      this.logger.error('Failed to crawl specific URL', error);
    } finally {
      await browser.close();
    }
  }

  async crawl(limit: number = 9999): Promise<void> {
    this.logger.log(`Starting Headless TopCV Crawl (Limit: ${limit} pages)...`);
    const browser = await chromium.launch({ headless: true });

    try {
      const context = await browser.newContext();
      const page = await context.newPage();

      const baseUrl = 'https://www.topcv.vn/tim-viec-lam-moi-nhat?sba=1';
      let currentPage = 1;
      let totalPages = 1;

      while (currentPage <= totalPages && currentPage <= limit) {
        const url = `${baseUrl}&page=${currentPage}`;
        this.logger.log(`Fetching page ${currentPage}/${totalPages}: ${url}`);

        await page.goto(url, { waitUntil: 'domcontentloaded' });

        // Extract total pages on the first page
        if (currentPage === 1) {
          const paginateText = await page.innerText('#job-listing-paginate-text');
          const match = (paginateText || '').match(/\/ (\d+) trang/);
          if (match) {
            totalPages = parseInt(match[1]);
          }
          this.logger.log(`Total pages to crawl: ${totalPages}`);
        }

        const jobItemUrls = await page.$$eval('.job-item-search-result h3.title a', (els) =>
          els.map((el) => (el as HTMLAnchorElement).href),
        );

        this.logger.log(`Found ${jobItemUrls.length} jobs on page ${currentPage}.`);

        for (const jobUrl of jobItemUrls) {
          const idMatch = jobUrl.match(/[/-]j?(\d+)(\.html|\?|$)/);
          const externalId = idMatch ? `topcv-${idMatch[1]}` : `topcv-${jobUrl}`;

          const existing = await this.jobsService.findByExternalId(externalId);
          try {
            // We reuse the page object for detail crawling
            const detailData = await this.fetchTopCVDetail(page, jobUrl);

            const jobData = this.normalizeJobData({
              ...detailData,
              externalId,
              source: 'topcv',
              url: jobUrl,
            });

            if (
              jobData &&
              jobData.title &&
              jobData.title !== 'N/A' &&
              jobData.company &&
              jobData.company !== 'N/A'
            ) {
              if (existing) {
                await this.jobsService.update(existing.id, jobData);
                this.logger.log(`Updated job: ${jobData.title} from TopCV`);
              } else {
                await this.jobsService.create(jobData);
                this.logger.log(`Imported job: ${jobData.title} from TopCV`);
              }
            } else {
              this.logger.warn(
                `Skipping job ${jobUrl} due to missing essential data (title/company)`,
              );
            }

            await new Promise((r) => setTimeout(r, 1000));
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            this.logger.error(`Failed to fetch details for ${jobUrl}`, message);
          }
        }

        currentPage++;
        await new Promise((r) => setTimeout(r, 2000));
      }
    } catch (error) {
      this.logger.error('Failed to fetch TopCV list page', error);
    } finally {
      await browser.close();
    }
  }

  private async fetchTopCVDetail(page: Page, url: string): Promise<TopCvDetailData> {
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    // Increased wait for dynamic content/anti-bot
    await page.waitForTimeout(2000);
    const content = await page.content();
    const $ = cheerio.load(content);

    // Try JSON-LD first
    const jsonLdData = ((): RawTopCVJob | null => {
      const scripts = $('script[type="application/ld+json"]').toArray();
      for (const el of scripts) {
        const scriptContent = $(el).text();
        const json = parseJsonLd(scriptContent);
        if (isJobPosting(json)) {
          return json;
        } else if (Array.isArray(json)) {
          const jobPosting = json.find((item: unknown) => isJobPosting(item));
          if (isJobPosting(jobPosting)) return jobPosting;
        }
      }
      return null;
    })();

    let description = '';
    let requirements = '';
    let benefits = '';

    // CSS Selectors Fallback/Extraction
    $('.job-description__item').each((_, el) => {
      const title = $(el).find('h3').text().trim();
      const content = $(el)
        .find('.job-description__item-content, .job-description__item--content')
        .html();

      if (title.includes('Mô tả công việc')) {
        description = content || '';
      } else if (title.includes('Yêu cầu ứng viên')) {
        requirements = content || '';
      } else if (title.includes('Quyền lợi') || title.includes('Phúc lợi')) {
        benefits = content || '';
      }
    });

    // Extract working time specifically if it's in a job-description__item
    let workingTime = '';
    $('.job-description__item').each((_, el) => {
      const title = $(el).find('h3').text().trim();
      if (title.toLowerCase().includes('thời gian làm việc')) {
        workingTime = $(el).find('.job-description__item--content').text().trim();
      }
    });

    // Branded layout support
    if (!description && !requirements) {
      const allHeaders = $('h2, h3');
      allHeaders.each((_, el) => {
        const title = $(el).text().trim();
        const content = $(el).next().html();
        if (title.includes('Mô tả công việc')) description = content || '';
        else if (title.includes('Yêu cầu ứng viên')) requirements = content || '';
        else if (title.includes('Quyền lợi')) benefits = content || '';
      });
    }

    const findGeneralInfo = (labelKey: string) => {
      let value = '';
      // Support multiple container types
      $('.box-general-group-info, .box-item, .box-main, .job-detail__info-section').each(
        (_, el) => {
          const items = $(el).find(
            '.box-main, .box-item, .box-info-item, .job-detail__info-section-item',
          );
          items.each((_, item) => {
            const label = $(item)
              .find('.box-main-title, strong, .label, .job-detail__info-section-label')
              .text();
            if (label.toLowerCase().includes(labelKey.toLowerCase())) {
              value = $(item)
                .find('.box-main-text, span, .value, .job-detail__info-section-content')
                .last()
                .text()
                .trim();
            }
          });
        },
      );

      if (!value) {
        $('.box-general-item, .job-detail__info--section').each((_, el) => {
          const label = $(el)
            .find('.box-general-item__title, .job-detail__info--section-label')
            .text()
            .trim();
          if (label.toLowerCase().includes(labelKey.toLowerCase())) {
            value = $(el)
              .find('.box-general-item__value, .job-detail__info--section-content')
              .text()
              .trim();
          }
        });
      }

      // Try for specific labeled pairs in company section or other boxes
      if (!value) {
        $('.box-item, .company-info__item, .job-detail__company--information-item').each(
          (_, el) => {
            const label = $(el).find('.title, .company-info__label, .company-title').text().trim();
            if (label.toLowerCase().includes(labelKey.toLowerCase())) {
              value = $(el).find('.value, .company-info__value, .company-value').text().trim();
            }
          },
        );
      }

      // Try custom-form-job__item layout
      if (!value) {
        $('.custom-form-job__item').each((_, el) => {
          const label = $(el).find('.custom-form-job__item--title').text().trim();
          if (label.toLowerCase().includes(labelKey.toLowerCase())) {
            value = $(el).find('.custom-form-job__item--content').text().trim();
          }
        });
      }

      return value;
    };

    const jobType = findGeneralInfo('Hình thức làm việc');
    const level = findGeneralInfo('Cấp bậc');
    const gender = findGeneralInfo('Giới tính');
    const quantityRaw = findGeneralInfo('Số lượng tuyển');
    let quantity = 0;
    if (quantityRaw) {
      const match = quantityRaw.match(/\d+/);
      if (match) {
        quantity = parseInt(match[0], 10);
      }
    }
    if (isNaN(quantity)) quantity = 0;
    const experienceLevel = findGeneralInfo('Kinh nghiệm');
    const education = findGeneralInfo('Học vấn');
    const industry = findGeneralInfo('Lĩnh vực');
    const allowance = findGeneralInfo('Phụ cấp');
    const equipment = findGeneralInfo('Thiết bị làm việc');
    // Keep internal workingTime if found in description item, else check general info
    if (!workingTime) {
      workingTime = findGeneralInfo('Thời gian làm việc');
    }

    const tags: string[] = [];
    $('.item.search-from-tag, .box-category-tag, .tag-item').each((_, el) => {
      const tag = $(el).text().trim();
      if (tag) tags.push(tag);
    });

    const categories: string[] = [];
    $('.breadcrumb li a, .breadcrumb .breadcrumb-item a').each((_, el) => {
      const text = $(el).text().trim();
      if (text && !['Trang chủ', 'Việc làm', 'Việc làm mới nhất'].includes(text)) {
        categories.push(text);
      }
    });

    // Smart fallback from tags if info is missing
    let refinedExperience = experienceLevel;
    let refinedEducation = education;

    if (!refinedExperience || refinedExperience === 'Not specified') {
      const expTag = tags.find(
        (t) => t.toLowerCase().includes('kinh nghiệm') || t.toLowerCase().includes('kn'),
      );
      if (expTag) refinedExperience = expTag;
    }

    if (!refinedEducation) {
      const eduTag = tags.find(
        (t) =>
          t.toLowerCase().includes('đại học') ||
          t.toLowerCase().includes('cao đẳng') ||
          t.toLowerCase().includes('trung cấp'),
      );
      if (eduTag) refinedEducation = eduTag;
    }

    // Verified Status
    const isVerified = $('.icon-verified-employer-tooltip, .icon-verified').length > 0;

    // Deadline
    let deadline: Date | null = null;
    const deadlineText = $('.job-detail__info--deadline, .deadline, .box-deadline')
      .first()
      .text()
      .replace('Hạn nộp hồ sơ:', '')
      .replace('Hạn nộp:', '')
      .trim();
    if (deadlineText) {
      const parts = deadlineText.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (parts) {
        deadline = new Date(`${parts[3]}-${parts[2]}-${parts[1]}`);
      }
    }

    const logoUrl =
      $('.company-logo img').first().attr('src') ||
      $('.box-company-logo img').first().attr('src') ||
      $('.box-company-brand .logo img').first().attr('src');

    let companyAddress =
      $('.company-address').first().text().trim() ||
      $('.box-company-address').first().text().trim() ||
      findGeneralInfo('Địa điểm làm việc');

    // Clean company address from multiple spaces/newlines
    companyAddress = companyAddress.replace(/\s+/g, ' ').trim();

    const companySize = $('.company-size').first().text().trim().replace(/\s+/g, ' ');
    const title = $('.job-detail__info--title, h1.title, h2.title, .job-title, .title-job, h1')
      .first()
      .text()
      .trim();
    const company =
      $(
        '.company-name, .company a, .company-brand-name, .navbar-diamond-company-brand, a.text-premium',
      )
        .first()
        .text()
        .trim() || jsonLdData?.hiringOrganization?.name;

    if (!title || title === 'N/A') {
      this.logger.warn(
        `Could not find title for ${url}. HTML snippet: ${content.substring(0, 500)}`,
      );
    }

    const salaryRaw = $(
      '.title-salary, .job-detail__info--section-content-value, .salary, .box-item .label-item',
    )
      .first()
      .text()
      .trim();

    const cleanHtml = (html: string | null) => {
      if (!html) return '';
      return DOMPurify.sanitize(html, {
        USE_PROFILES: { html: true },
        FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
      }).trim();
    };

    return {
      title: title || 'N/A',
      company: company || 'N/A',
      salaryRaw: salaryRaw || 'Thỏa thuận',
      description: cleanHtml(description || jsonLdData?.description),
      requirements: cleanHtml(requirements),
      benefits: cleanHtml(benefits),
      jobType: jobType || jsonLdData?.employmentType,
      experienceLevel:
        refinedExperience || jsonLdData?.experienceRequirements?.occupationalCategory,
      education: refinedEducation,
      level,
      gender,
      quantity,
      deadline: deadline || (jsonLdData?.validThrough ? new Date(jsonLdData.validThrough) : null),
      logoUrl: logoUrl || jsonLdData?.hiringOrganization?.logo,
      companyAddress,
      companySize,
      industry,
      allowance,
      equipment,
      workingTime: workingTime || findGeneralInfo('Giờ làm việc'),
      city: (jsonLdData?.jobLocation?.address?.addressRegion || '')
        .replace('Thành phố ', '')
        .replace('Tỉnh ', '')
        .trim(),
      tags: tags.map((t) => t.trim()).filter((t) => t.length > 0),
      categories: categories.map((c) => c.trim()).filter((c) => c.length > 0),
      isBranded: url.includes('/brand/'),
      isVerified,
      jsonLd: jsonLdData,
    };
  }

  private normalizeJobData(raw: TopCvDetailData) {
    const salaryParsed = this.normalizationService.parseSalary(raw.salaryRaw);

    return {
      externalId: raw.externalId,
      title: raw.title,
      company: raw.company,
      location: raw.location || raw.companyAddress,
      salaryMin: salaryParsed.min,
      salaryMax: salaryParsed.max,
      currency: salaryParsed.currency,
      salary: raw.salaryRaw,
      description: this.normalizationService.sanitizeHtml(raw.description),
      requirements: this.normalizationService.sanitizeHtml(raw.requirements),
      benefits: this.normalizationService.sanitizeHtml(raw.benefits),
      jobType: this.normalizationService.normalizeJobType(raw.jobType),
      experienceLevel: this.normalizationService.normalizeExperienceLevel(raw.experienceLevel),
      education: raw.education,
      level: raw.level,
      gender: raw.gender,
      quantity: raw.quantity,
      deadline: raw.deadline,
      allowance: raw.allowance,
      equipment: raw.equipment,
      industry: raw.industry,
      logoUrl: raw.logoUrl,
      companyAddress: raw.companyAddress,
      companySize: raw.companySize,
      workingTime: (raw.workingTime || '').replace(/\s+/g, ' ').trim(),
      city: this.normalizationService.normalizeCity(raw.city || raw.companyAddress),
      tags: Array.from(new Set(raw.tags || [])), // De-duplicate tags
      categories: raw.categories || [],
      isBranded: raw.isBranded || false,
      isVerified: raw.isVerified || false,
      source: raw.source,
      url: raw.url,
      skills: this.parseSkills(raw.jsonLd?.skills, raw.tags),
      postedAt: raw.jsonLd?.datePosted ? new Date(raw.jsonLd.datePosted) : new Date(),
      originalData: { jsonLd: raw.jsonLd },
    };
  }

  private parseSkills(skillsData: string | string[] | undefined, tags: string[] = []): string[] {
    let skillsArray: string[] = [];

    // Parse skills from JSON-LD (can be string or array)
    if (typeof skillsData === 'string') {
      skillsArray = skillsData
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    } else if (Array.isArray(skillsData)) {
      skillsArray = skillsData.map((s) => String(s).trim()).filter((s) => s.length > 0);
    }

    // Merge with tags as fallback/supplement
    const combined = [...skillsArray, ...tags];

    // De-duplicate and filter out very short/invalid entries
    return Array.from(new Set(combined))
      .filter((s) => s.length > 1)
      .map((s) => s.replace(/\s+/g, ' ').trim());
  }
}
