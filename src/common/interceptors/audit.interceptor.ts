import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Request } from 'express';
import { AuditService } from '../../modules/audit/audit.service';
import { AUDIT_ACTION_KEY, AuditActionOptions } from '../decorators/audit-log.decorator';
import { User } from '../../modules/users/entities/user.entity';

interface RequestWithUser extends Request {
  user?: User;
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const auditOptions = this.reflector.get<AuditActionOptions>(
      AUDIT_ACTION_KEY,
      context.getHandler(),
    );

    if (!auditOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    const ip = request.ip;
    const body = request.body as Record<string, unknown>;
    const params = request.params as Record<string, string>;
    const query = request.query as Record<string, unknown>;
    const userAgent = request.get('user-agent') || null;

    return next.handle().pipe(
      tap((data: unknown) => {
        this.auditService
          .createLog({
            userId: user?.id || null,
            action: auditOptions.action,
            module: auditOptions.module,
            payload: { body, params, query },
            newData: (data as Record<string, unknown>) || null,
            ipAddress: ip || null,
            userAgent,
            status: 'SUCCESS',
          })
          .catch((error: unknown) => {
            const errorMessage = error instanceof Error ? error.stack : String(error);
            this.logger.error('Failed to create audit log', errorMessage);
          });
      }),
      catchError((err: Error) => {
        this.auditService
          .createLog({
            userId: user?.id || null,
            action: auditOptions.action,
            module: auditOptions.module,
            payload: { body, params, query },
            ipAddress: ip || null,
            userAgent,
            status: 'FAILURE',
            errorMessage: err.message,
          })
          .catch((e: unknown) => {
            const errorMessage = e instanceof Error ? e.stack : String(e);
            this.logger.error('Failed to create failure audit log', errorMessage);
          });

        return throwError(() => err);
      }),
    );
  }
}
