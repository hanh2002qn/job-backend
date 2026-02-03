import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { WorkerModule } from './worker.module';

async function bootstrap() {
  const logger = new Logger('Worker');

  const app = await NestFactory.createApplicationContext(WorkerModule);

  logger.log('🔧 Worker application started');
  logger.log('📋 Listening for queue jobs...');

  // Handle shutdown gracefully
  const shutdown = () => {
    logger.log('Shutting down worker...');
    void app.close().then(() => process.exit(0));
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((err: Error) => {
  process.stderr.write(`Worker failed to start: ${err.message}\n`);
  process.exit(1);
});
