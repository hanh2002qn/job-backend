export interface NormalizedJobData {
    externalId: string;
    title: string;
    company: string;
    location: string;
    salaryMin: number;
    salaryMax: number;
    currency: string;
    salary: string;
    description: string;
    jobType: string;
    experienceLevel: string;
    source: string;
    url: string;
    skills: string[];
}

export interface JobCrawlerStrategy {
    name: string;
    crawl(): Promise<void>;
}
