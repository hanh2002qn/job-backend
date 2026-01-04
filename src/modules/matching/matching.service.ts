import { Injectable, NotFoundException } from '@nestjs/common';
import { ProfilesService } from '../profiles/profiles.service';
import { JobsService } from '../jobs/jobs.service';

@Injectable()
export class MatchingService {
    constructor(
        private profilesService: ProfilesService,
        private jobsService: JobsService,
    ) { }

    async matchJobs(userId: string) {
        const profile = await this.profilesService.findByUserId(userId);
        if (!profile) {
            throw new NotFoundException('Profile not found');
        }

        // Get all jobs (in a real app, we might limit this or use DB filters)
        // For now, we search all open jobs
        const jobs = await this.jobsService.findAll({});

        const userSkills = profile.skills?.map(s => s.toLowerCase()) || [];

        const matchedJobs = jobs.map((job) => {
            const jobSkills = job.skills?.map(s => s.toLowerCase()) || [];
            if (jobSkills.length === 0) return { ...job, matchScore: 0 };

            const matchingSkills = jobSkills.filter(skill => userSkills.includes(skill));
            const matchScore = Math.round((matchingSkills.length / jobSkills.length) * 100);

            return {
                ...job,
                matchScore,
                matchedSkills: matchingSkills,
            };
        });

        // Return truncated list sorted by score
        return matchedJobs
            .filter((job) => job.matchScore > 0)
            .sort((a, b) => b.matchScore - a.matchScore);
    }
}
