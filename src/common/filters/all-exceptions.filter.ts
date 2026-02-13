import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<AuthenticatedRequest>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException ? exception.getResponse() : 'Internal server error';

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message:
        typeof message === 'string'
          ? message
          : ((message as Record<string, unknown>).message ?? message),
    };

    // Log full error context for non-4xx errors
    if (status >= 500) {
      this.logger.error(
        JSON.stringify({
          ...errorResponse,
          userId: request.user?.id ?? null,
          stack: exception instanceof Error ? exception.stack : undefined,
          // FUTURE: Add Sentry capture here
          // Sentry.captureException(exception);
        }),
      );
    } else {
      this.logger.warn(JSON.stringify(errorResponse));
    }

    response.status(status).json(errorResponse);
  }
}
