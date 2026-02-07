import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { JobsModule } from '../jobs/jobs.module';
import { CvModule } from '../cv/cv.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { AuthModule } from '../auth/auth.module';
import { FeedbackModule } from '../feedback/feedback.module';
import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminJobsController } from './controllers/admin-jobs.controller';
import { AdminCrawlerController } from './controllers/admin-crawler.controller';
import { AdminDashboardController } from './controllers/admin-dashboard.controller';
import { AdminDashboardService } from './services/admin-dashboard.service';
import { User } from '../users/entities/user.entity';
import { Job } from '../jobs/entities/job.entity';
import { CV } from '../cv/entities/cv.entity';
import { Subscription } from '../subscription/entities/subscription.entity';
import { Plan } from '../subscription/entities/plan.entity';
import { AdminPlanController } from './controllers/admin-plan.controller';
import { AdminPlanService } from './services/admin-plan.service';
import { AdminPromptController } from './controllers/admin-prompt.controller';
import { AdminAiController } from './controllers/admin-ai.controller';
import { AdminPromptService } from './services/admin-prompt.service';
import { AdminModerationController } from './controllers/admin-moderation.controller';
import { AdminSupportController } from './controllers/admin-support.controller';
import { AdminCouponController } from './controllers/admin-coupon.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Job, CV, Subscription, Plan]),
    UsersModule,
    JobsModule,

    CvModule,
    SubscriptionModule,
    AuthModule,
    FeedbackModule,
  ],
  controllers: [
    AdminUsersController,
    AdminJobsController,
    AdminCrawlerController,
    AdminDashboardController,
    AdminPlanController,
    AdminPromptController,
    AdminAiController,
    AdminModerationController,
    AdminSupportController,
    AdminCouponController,
  ],
  providers: [AdminDashboardService, AdminPlanService, AdminPromptService],
})
export class AdminModule {}
