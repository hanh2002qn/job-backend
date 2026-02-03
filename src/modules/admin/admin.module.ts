import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { JobsModule } from '../jobs/jobs.module';
import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminJobsController } from './controllers/admin-jobs.controller';
import { AdminCrawlerController } from './controllers/admin-crawler.controller';

@Module({
  imports: [UsersModule, JobsModule],
  controllers: [AdminUsersController, AdminJobsController, AdminCrawlerController],
})
export class AdminModule {}
