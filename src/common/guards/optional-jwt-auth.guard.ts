import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = unknown>(
    err: unknown,
    user: TUser,
    _info: unknown,
    _context: unknown,
  ): TUser | undefined {
    if (user) {
      return user;
    }
    return undefined; // No user, but allow access
  }
}
