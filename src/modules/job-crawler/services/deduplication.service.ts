import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as crypto from 'crypto';
import { Job } from '../../jobs/entities/job.entity';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingJobId: string | null;
  matchType: 'exact_hash' | 'external_id' | 'fuzzy_title' | 'none';
  similarity?: number;
}

@Injectable()
export class DeduplicationService {
  constructor(
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
  ) {}

  /**
   * Generate SHA256 hash from job content for exact matching
   */
  generateContentHash(title: string, company: string, location: string): string {
    const normalized = `${this.normalizeString(title)}|${this.normalizeString(company)}|${this.normalizeString(location)}`;
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  /**
   * Check if job is a duplicate using multiple strategies
   */
  async checkDuplicate(
    title: string,
    company: string,
    location: string,
    externalId?: string,
  ): Promise<DuplicateCheckResult> {
    // 1. Check by externalId first (fastest)
    if (externalId) {
      const byExternalId = await this.jobsRepository.findOne({
        where: { externalId },
        select: ['id'],
      });
      if (byExternalId) {
        return {
          isDuplicate: true,
          existingJobId: byExternalId.id,
          matchType: 'external_id',
        };
      }
    }

    // 2. Check by content hash (exact match)
    const contentHash = this.generateContentHash(title, company, location);
    const byHash = await this.jobsRepository.findOne({
      where: { contentHash },
      select: ['id'],
    });
    if (byHash) {
      return {
        isDuplicate: true,
        existingJobId: byHash.id,
        matchType: 'exact_hash',
      };
    }

    // 3. Fuzzy title matching within same company (recent jobs only)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const candidateJobs = await this.jobsRepository.find({
      where: {
        company: company,
        createdAt: MoreThan(thirtyDaysAgo),
      },
      select: ['id', 'title'],
      take: 50,
    });

    for (const candidate of candidateJobs) {
      const similarity = this.calculateSimilarity(title, candidate.title);
      if (similarity > 0.9) {
        return {
          isDuplicate: true,
          existingJobId: candidate.id,
          matchType: 'fuzzy_title',
          similarity,
        };
      }
    }

    return {
      isDuplicate: false,
      existingJobId: null,
      matchType: 'none',
    };
  }

  /**
   * Find existing job to update (less strict matching)
   */
  async findExistingJob(externalId?: string, contentHash?: string): Promise<Job | null> {
    if (externalId) {
      const job = await this.jobsRepository.findOne({ where: { externalId } });
      if (job) return job;
    }

    if (contentHash) {
      const job = await this.jobsRepository.findOne({ where: { contentHash } });
      if (job) return job;
    }

    return null;
  }

  /**
   * Levenshtein distance based similarity (0-1)
   */
  calculateSimilarity(str1: string, str2: string): number {
    const s1 = this.normalizeString(str1);
    const s2 = this.normalizeString(str2);

    if (s1 === s2) return 1;
    if (s1.length === 0 || s2.length === 0) return 0;

    const len1 = s1.length;
    const len2 = s2.length;
    const maxLen = Math.max(len1, len2);

    // Create matrix with proper typing
    const matrix: number[][] = [];
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [];
      for (let j = 0; j <= len2; j++) {
        matrix[i][j] = 0;
      }
    }

    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // deletion
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j - 1] + cost, // substitution
        );
      }
    }

    const distance = matrix[len1][len2];
    return 1 - distance / maxLen;
  }

  private normalizeString(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '');
  }
}
