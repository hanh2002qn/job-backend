import { Injectable, NestMiddleware, ServiceUnavailableException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SettingsService } from '../../modules/settings/settings.service';

@Injectable()
export class MaintenanceMiddleware implements NestMiddleware {
  constructor(private readonly settingsService: SettingsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Skip for specific paths if needed (e.g., auth login, admin routes)
    // We check /api prefix as well if applicable
    const path = req.originalUrl || req.path;

    if (path.includes('/admin') || path.includes('/auth/login') || path.includes('/health')) {
      return next();
    }

    const isMaintenance = this.settingsService.getSettingFromCache<boolean>('maintenance_mode');

    if (isMaintenance === true) {
      // Allow Admin to access even in maintenance mode
      // User might be attached to request by Passport/Guard later,
      // but middleware runs BEFORE guards.
      // If we need role check, a Guard is better.
      // However, we already skipped '/admin' routes which require Admin role usually.
      throw new ServiceUnavailableException('System is under maintenance. Please try again later.');
    }

    next();
  }
}
