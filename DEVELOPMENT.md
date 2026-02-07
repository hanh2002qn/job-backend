# Development Guide

## Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL 14+
- Redis

## Installation

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env
# Edit .env with your configuration
```

## Running Locally

```bash
# Start dependencies
docker-compose up -d          # PostgreSQL
docker-compose -f docker-compose.redis.yml up -d  # Redis

# Development mode (auto-reload)
pnpm run start:dev

# Run worker (background jobs)
pnpm run start:worker
```

## Database

```bash
# Generate migration
pnpm run migration:generate -- src/database/migrations/MigrationName

# Run migrations
pnpm run migration:run

# Revert last migration
pnpm run migration:revert
```

## Testing

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Coverage
pnpm run test:cov
```

## Code Style

- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier
- **TypeScript**: Strict mode, no `any` type

```bash
# Lint
pnpm run lint

# Format
pnpm run format
```

## Project Scripts

| Command        | Description             |
| -------------- | ----------------------- |
| `start:dev`    | Run in development mode |
| `start:prod`   | Run production build    |
| `start:worker` | Run background worker   |
| `build`        | Build for production    |
| `lint`         | Run ESLint              |
| `test`         | Run unit tests          |
| `test:e2e`     | Run E2E tests           |
