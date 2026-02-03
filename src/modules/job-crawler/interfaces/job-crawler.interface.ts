import {
  City,
  Currency,
  Education,
  Gender,
  Industry,
  JobLevel,
  JobType,
} from '../../jobs/enums/job.enums';

export interface RawLinkedInJob {
  externalId: string;
  title: string;
  company: string;
  location: string;
  salaryRaw?: string;
  description: string;
  source: string;
  url: string;
  postedAt?: Date;
}

export interface RawTopCVJob {
  '@type'?: string;
  title?: string;
  description?: string;
  hiringOrganization?: {
    name?: string;
    logo?: string;
    address?: string;
    numberOfEmployees?: string;
  };
  jobLocation?: {
    address?: {
      addressLocality?: string;
      addressRegion?: string;
    };
  };
  baseSalary?: {
    value?: {
      minValue?: number;
      maxValue?: number;
      unitText?: string;
    };
  };
  employmentType?: string;
  experienceRequirements?: {
    occupationalCategory?: string;
  };
  validThrough?: string;
  datePosted?: string;
  skills?: string;
  identifier?: {
    value?: string;
  };
}

export interface OriginalJobData {
  rawHtml?: string;
  jsonLd?: RawTopCVJob | null;
}

export interface NormalizedJobData {
  externalId: string;
  title: string;
  company: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  currency: Currency;
  salary: string;
  description: string;
  requirements?: string;
  benefits?: string;
  jobType: JobType;
  experienceLevel: JobLevel;
  level?: string;
  education?: Education;
  city?: City;
  source: string;
  url: string;
  skills: string[];
  postedAt?: Date;
  deadline?: Date | null;
  logoUrl?: string;
  companyAddress?: string;
  companySize?: string;
  workingTime?: string;
  quantity?: number;
  gender?: Gender;
  industry?: Industry;
  tags?: string[];
  categories?: string[];
  isBranded?: boolean;
  isVerified?: boolean;
  allowance?: string;
  equipment?: string;
  originalData?: OriginalJobData;
}

export interface JobCrawlerStrategy {
  name: string;
  crawl(limit?: number): Promise<void>;
  crawlSpecificUrl?(url: string): Promise<void>;
}
