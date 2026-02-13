import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import {
  ExtensionEventDto,
  ExtensionEventType,
  JobStatusResponseDto,
} from './dto/extension-event.dto';
import { JobTracker, ApplicationStatus } from '../tracker/entities/job-tracker.entity';
import { Job } from '../jobs/entities/job.entity';
import { ExtractJobDto } from './dto/extract-job.dto';
import { LLM_SERVICE, type LlmService } from '../ai/llm.interface';

@Injectable()
export class ExtensionService {
  private readonly logger = new Logger(ExtensionService.name);

  constructor(
    @InjectRepository(JobTracker)
    private trackerRepository: Repository<JobTracker>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @Inject(LLM_SERVICE) private llmService: LlmService,
  ) {}

  /**
   * Use AI to extract structured job data from raw content
   */
  async extractJob(dto: ExtractJobDto) {
    const prompt = `
      You are an expert recruitment assistant.
      Task: Extract structured job information from the following raw page content.
      
      URL: ${dto.url}
      Platform: ${dto.platform || 'Unknown'}
      
      RAW CONTENT:
      ${dto.rawContent.substring(0, 10000)} // Limit content length for Gemini
      
      Return ONLY a JSON object with this structure:
      {
        "title": "Job Title",
        "company": "Company Name",
        "location": "Job Location",
        "salary": "Salary range or 'Not specified'",
        "description": "Short summary of the role",
        "skills": ["skill1", "skill2"],
        "requirements": ["req1", "req2"]
      }
    `;

    try {
      const extractedData = await this.llmService.generateJson<{
        title: string;
        company: string;
        location: string;
        salary: string;
        description: string;
        skills: string[];
        requirements: string[];
      }>(prompt);

      return extractedData;
    } catch (error) {
      this.logger.error('Failed to extract job data with AI', error);
      throw new Error('AI extraction failed');
    }
  }

  /**
   * Handle events coming from browser extension
   */
  async handleEvent(userId: string, dto: ExtensionEventDto): Promise<JobTracker> {
    this.logger.log(`Extension event: ${dto.eventType} for ${dto.jobUrl}`);

    // Try to find matching job in our DB by URL
    let job = await this.jobRepository.findOne({
      where: { url: dto.jobUrl },
    });

    // If not found by exact URL, try to extract external ID and search
    if (!job) {
      const externalId = this.extractExternalId(dto.jobUrl, dto.platform);
      if (externalId) {
        job = await this.jobRepository.findOne({
          where: { externalId },
        });
      }
    }

    // Check if tracker already exists for this user and job/url
    let tracker = await this.findExistingTracker(userId, dto.jobUrl, job?.id);

    const newStatus = this.mapEventToStatus(dto.eventType);

    if (tracker) {
      // Update existing tracker
      tracker.status = newStatus;
      if (newStatus === ApplicationStatus.APPLIED && !tracker.appliedAt) {
        tracker.appliedAt = new Date();
      }
      this.logger.log(`Updated tracker ${tracker.id} to status: ${newStatus}`);
    } else {
      // Create new tracker
      const trackerData: Partial<JobTracker> = {
        userId,
        manualUrl: dto.jobUrl,
        manualTitle: dto.jobTitle || job?.title,
        manualCompany: dto.companyName || job?.company,
        status: newStatus,
      };

      if (job?.id) {
        trackerData.jobId = job.id;
      }

      if (newStatus === ApplicationStatus.APPLIED) {
        trackerData.appliedAt = new Date();
      }

      tracker = this.trackerRepository.create(trackerData);
      this.logger.log(`Created new tracker for job: ${dto.jobTitle || dto.jobUrl}`);
    }

    return this.trackerRepository.save(tracker);
  }

  /**
   * Get job status for extension popup
   */
  async getJobStatus(userId: string, jobUrl: string): Promise<JobStatusResponseDto> {
    // Try to find by URL in jobs table
    const job = await this.jobRepository.findOne({
      where: { url: jobUrl },
    });

    // Find tracker
    const tracker = await this.findExistingTracker(userId, jobUrl, job?.id);

    if (!tracker) {
      return {
        tracked: false,
        jobId: job?.id,
      };
    }

    return {
      tracked: true,
      status: tracker.status,
      trackerId: tracker.id,
      jobId: job?.id || undefined,
    };
  }

  /**
   * Find existing tracker by URL or jobId
   */
  private async findExistingTracker(
    userId: string,
    jobUrl: string,
    jobId?: string,
  ): Promise<JobTracker | null> {
    // First try by jobId if we have it
    if (jobId) {
      const tracker = await this.trackerRepository.findOne({
        where: { userId, jobId },
      });
      if (tracker) return tracker;
    }

    // Try by manualUrl
    const trackerByUrl = await this.trackerRepository.findOne({
      where: { userId, manualUrl: jobUrl },
    });
    if (trackerByUrl) return trackerByUrl;

    // Try by URL pattern (without query params)
    const baseUrl = jobUrl.split('?')[0];
    const trackerByBaseUrl = await this.trackerRepository.findOne({
      where: { userId, manualUrl: Like(`${baseUrl}%`) },
    });

    return trackerByBaseUrl;
  }

  /**
   * Map extension event type to application status
   */
  private mapEventToStatus(eventType: ExtensionEventType): ApplicationStatus {
    const statusMap: Record<ExtensionEventType, ApplicationStatus> = {
      [ExtensionEventType.JOB_VIEWED]: ApplicationStatus.SAVED,
      [ExtensionEventType.JOB_APPLIED]: ApplicationStatus.APPLIED,
      [ExtensionEventType.APPLICATION_SUBMITTED]: ApplicationStatus.APPLIED,
      [ExtensionEventType.INTERVIEW_SCHEDULED]: ApplicationStatus.INTERVIEW,
      [ExtensionEventType.OFFER_RECEIVED]: ApplicationStatus.OFFER,
      [ExtensionEventType.REJECTED]: ApplicationStatus.REJECTED,
    };
    return statusMap[eventType] || ApplicationStatus.SAVED;
  }

  /**
   * Extract external ID from job URL based on platform
   */
  private extractExternalId(url: string, platform: string): string | null {
    try {
      switch (platform) {
        case 'topcv': {
          // TopCV URLs: /viec-lam/xxx-j12345.html or /viec-lam/12345
          const match = url.match(/[/-]j?(\d+)(\.html|$|\?)/);
          return match ? `topcv-${match[1]}` : null;
        }
        case 'linkedin': {
          // LinkedIn URLs: /jobs/view/12345
          const match = url.match(/\/jobs\/view\/(\d+)/);
          return match ? `linkedin-${match[1]}` : null;
        }
        case 'vietnamworks': {
          // VietnamWorks: /viec-lam/xxx-12345-jv
          const match = url.match(/-(\d+)-jv/);
          return match ? `vietnamworks-${match[1]}` : null;
        }
        default:
          return null;
      }
    } catch {
      return null;
    }
  }
}
