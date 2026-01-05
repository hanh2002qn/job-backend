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

        const jobs = await this.jobsService.findAll({});
        const userSkills = profile.skills?.map(s => s.toLowerCase().trim()) || [];

        const matchedJobs = jobs.map((job) => {
            const result = this.calculateMatch(job, profile, userSkills);
            return {
                ...job,
                ...result,
            };
        });

        return matchedJobs
            .filter((job) => job.matchScore > 10) // Only show relevant ones
            .sort((a, b) => b.matchScore - a.matchScore);
    }

    async matchSpecificJob(userId: string, jobId: string) {
        const profile = await this.profilesService.findByUserId(userId);
        const job = await this.jobsService.findOne(jobId);

        if (!job) throw new NotFoundException('Job not found');

        const userSkills = profile.skills?.map(s => s.toLowerCase().trim()) || [];
        const result = this.calculateMatch(job, profile, userSkills);

        // Add extra AI-like insights
        const recommendations = result.missingSkills.length > 0
            ? `To better fit this role, focus on learning: ${result.missingSkills.slice(0, 3).join(', ')}.`
            : "Your profile is an excellent match for this role!";

        return {
            job,
            ...result,
            recommendations,
            experienceMatch: this.isExperienceMatch(job.experienceLevel, profile.experience),
        };
    }

    private calculateMatch(job: any, profile: any, userSkills: string[]) {
        const jobSkills = job.skills?.map(s => s.toLowerCase().trim()) || [];

        if (jobSkills.length === 0) {
            return { matchScore: 50, matchedSkills: [], missingSkills: [], skillGap: 0 };
        }

        const matchedSkills = jobSkills.filter(skill =>
            userSkills.some(us => us.includes(skill) || skill.includes(us))
        );

        const missingSkills = jobSkills.filter(skill =>
            !userSkills.some(us => us.includes(skill) || skill.includes(us))
        );

        // Scoring Logic (0-100)
        let skillScore = Math.round((matchedSkills.length / jobSkills.length) * 100);

        // Factor in Location (+10 points)
        let bonus = 0;
        if (profile.address && job.location && job.location.toLowerCase().includes(profile.address.toLowerCase())) {
            bonus += 10;
        }

        // Factor in Industry (+5 points)
        if (profile.preferredIndustries?.some(ind => job.category?.toLowerCase().includes(ind.toLowerCase()))) {
            bonus += 5;
        }

        const matchScore = Math.min(100, skillScore + bonus);

        return {
            matchScore,
            matchedSkills,
            missingSkills,
            skillGap: jobSkills.length - matchedSkills.length,
        };
    }

    private isExperienceMatch(requiredLevel: string, userExp: any[]) {
        if (!requiredLevel) return true;

        // Simple heuristic: count years of experience
        const totalYears = (userExp || []).reduce((sum, exp) => {
            // Mock logic: assume each exp is 1 year if not specified
            return sum + (exp.years || 1);
        }, 0);

        if (requiredLevel.toLowerCase().includes('senior') && totalYears < 5) return false;
        if (requiredLevel.toLowerCase().includes('middle') && totalYears < 2) return false;

        return true;
    }
}
