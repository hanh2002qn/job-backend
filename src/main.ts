import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Sentry Initialization
  const sentryDsn = configService.get<string>('SENTRY_DSN');
  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      integrations: [nodeProfilingIntegration()],
      // Performance Monitoring
      tracesSampleRate: 1.0, //  Capture 100% of the transactions
      // Set sampling rate for profiling - this is relative to tracesSampleRate
      profilesSampleRate: 1.0,
      debug: configService.get<string>('SENTRY_DEBUG') === 'true',
      environment: configService.get<string>('NODE_ENV', 'development'),
    });
    Logger.log('Sentry initialized successfully');
  }

  // Global Prefix
  app.setGlobalPrefix('api');

  // Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalInterceptors(new LoggingInterceptor());

  // CORS
  const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:3001');
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  // Swagger Setup (Only in non-production)
  if (configService.get<string>('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('AI Job Application Context API')
      .setDescription('The AI Job Application API description')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
    Logger.log(`Swagger documentation running on: http://localhost:3000/docs`);
  }

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  Logger.log(`Application running on: http://localhost:${port}/api`);
}

void bootstrap();
