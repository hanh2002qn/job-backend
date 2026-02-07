import { Injectable, NestMiddleware, ServiceUnavailableException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CacheService } from '../../common/redis/cache.service';

@Injectable()
export class MaintenanceMiddleware implements NestMiddleware {
  constructor(private readonly cacheService: CacheService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Skip for admin routes or specific paths if needed
    if (req.path.startsWith('/admin') || req.path.startsWith('/auth/login')) {
      return next();
    }

    const isMaintenance = await this.cacheService.get<string>('MAINTENANCE_MODE');
    if (isMaintenance === 'true') {
      throw new ServiceUnavailableException('System is under maintenance. Please try again later.');
    }

    next();
  }
}
