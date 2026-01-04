import { Injectable } from '@nestjs/common';
import { TrackerService } from '../tracker/tracker.service';
import { CvService } from '../cv/cv.service';
import { ApplicationStatus } from '../tracker/entities/job-tracker.entity';

@Injectable()
export class AnalyticsService {
    constructor(
        private trackerService: TrackerService,
        private cvService: CvService,
    ) { }

    async getOverview(userId: string) {
        const trackedJobs = await this.trackerService.findAll(userId);
        const cvs = await this.cvService.findAll(userId);

        const totalApplications = trackedJobs.filter(t => t.status !== ApplicationStatus.SAVED).length;
        const interviews = trackedJobs.filter(t => t.status === ApplicationStatus.INTERVIEW).length;
        const offers = trackedJobs.filter(t => t.status === ApplicationStatus.OFFER).length;

        return {
            totalTracked: trackedJobs.length,
            totalApplications,
            interviews,
            offers,
            generatedCVs: cvs.length,
            conversionRate: totalApplications > 0 ? ((interviews / totalApplications) * 100).toFixed(2) + '%' : '0%',
        };
    }
}
