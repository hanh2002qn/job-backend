import { Request } from 'express';
import { User } from '../../modules/users/entities/user.entity';

import { Subscription } from '../../modules/subscription/entities/subscription.entity';

export interface AuthenticatedRequest extends Request {
  user: User;
  subscription?: Subscription;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}
