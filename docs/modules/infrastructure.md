# Common Infrastructure

Shared utilities, guards, decorators, and services.

## Location

`src/common/`

## Directory Structure

```
common/
├── decorators/       # Custom decorators
├── dto/              # Shared DTOs
├── filters/          # Exception filters
├── guards/           # Auth guards
├── interceptors/     # Request interceptors
├── interfaces/       # Shared interfaces
├── middleware/       # HTTP middleware
├── redis/            # Redis module
└── services/         # Shared services
```

## Decorators

### @CurrentUser()

Extract current user from request:

```typescript
@Get('profile')
getProfile(@CurrentUser() user: User) {
  return user;
}
```

### @Public()

Mark route as public (no auth required):

```typescript
@Public()
@Post('login')
login() {}
```

## Guards

| Guard               | Purpose            | Usage                 |
| ------------------- | ------------------ | --------------------- |
| `JwtAuthGuard`      | Validate JWT token | Default on all routes |
| `RolesGuard`        | Check user roles   | `@Roles('admin')`     |
| `AdminGuard`        | Admin-only access  | Admin controllers     |
| `SubscriptionGuard` | Check subscription | Premium features      |

## Services

### S3Service

AWS S3 file operations:

```typescript
class S3Service {
  async uploadFile(file: Buffer, key: string): Promise<string>;
  async getSignedUrl(key: string): Promise<string>;
  async deleteFile(key: string): Promise<void>;
}
```

### FileUploadModule

Multer-based file upload handling.

## Redis Module

Shared Redis connection for:

- Rate limiting (Throttler)
- Caching
- Session storage

```typescript
// Usage in any module
import { RedisModule } from 'src/common/redis/redis.module';

@Module({
  imports: [RedisModule],
})
export class MyModule {}
```

## Middleware

### MaintenanceMiddleware

Returns 503 when maintenance mode is enabled.

## Configuration

```bash
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_S3_REGION=ap-southeast-1
```
