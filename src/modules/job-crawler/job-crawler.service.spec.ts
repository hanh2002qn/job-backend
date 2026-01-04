import { Test, TestingModule } from '@nestjs/testing';
import { JobCrawlerService } from './job-crawler.service';

describe('JobCrawlerService', () => {
  let service: JobCrawlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobCrawlerService],
    }).compile();

    service = module.get<JobCrawlerService>(JobCrawlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
