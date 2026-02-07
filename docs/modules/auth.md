# Auth Module

Authentication and authorization system.

## Overview

- **Location**: `src/modules/auth/`
- **Dependencies**: `UsersModule`, `MailModule`, `PassportModule`, `JwtModule`

## Features

### JWT Authentication

- Token-based auth with configurable expiration
- Tokens stored in `Authorization: Bearer <token>` header
- `JwtStrategy` validates tokens

### OAuth Providers

| Provider | Strategy         | Callback                |
| -------- | ---------------- | ----------------------- |
| Google   | `GoogleStrategy` | `/auth/google/callback` |
| GitHub   | `GithubStrategy` | `/auth/github/callback` |
| Apple    | `AppleStrategy`  | `/auth/apple/callback`  |

### Password Management

- Password reset via email token
- Secure password hashing with bcrypt

## Key Files

| File                 | Purpose          |
| -------------------- | ---------------- |
| `auth.controller.ts` | Auth endpoints   |
| `auth.service.ts`    | Auth logic       |
| `jwt.strategy.ts`    | JWT validation   |
| `strategies/*.ts`    | OAuth strategies |

## Guards

```typescript
// Protect route with JWT
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@CurrentUser() user: User) {}

// Make route public
@Public()
@Post('login')
login() {}
```

## Configuration

```bash
JWT_SECRET=your-secret-key
JWT_EXPIRATION=1d

# OAuth
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx

APPLE_CLIENT_ID=xxx
APPLE_TEAM_ID=xxx
APPLE_KEY_ID=xxx
APPLE_PRIVATE_KEY=xxx
```
