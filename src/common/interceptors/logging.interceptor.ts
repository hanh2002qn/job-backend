import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const { method, path, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const userId = request.user?.id ?? 'anonymous';
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse<Response>();
        const duration = Date.now() - now;

        this.logger.log(
          JSON.stringify({
            method,
            path,
            statusCode: response.statusCode,
            duration: `${duration}ms`,
            ip,
            userId,
            userAgent,
          }),
        );
      }),
      catchError((error: Error) => {
        const duration = Date.now() - now;

        this.logger.error(
          JSON.stringify({
            method,
            path,
            duration: `${duration}ms`,
            ip,
            userId,
            error: error.message,
          }),
        );

        return throwError(() => error);
      }),
    );
  }
}
