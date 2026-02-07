import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-apple';

export interface AppleProfile {
  appleId: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('APPLE_CLIENT_ID') || 'not-configured',
      teamID: configService.get<string>('APPLE_TEAM_ID') || 'not-configured',
      keyID: configService.get<string>('APPLE_KEY_ID') || 'not-configured',
      privateKeyString: configService.get<string>('APPLE_PRIVATE_KEY')?.replace(/\\n/g, '\n') || '',
      callbackURL:
        configService.get<string>('APPLE_CALLBACK_URL') ||
        'http://localhost:3000/auth/apple/callback',
      passReqToCallback: false,
      scope: ['email', 'name'],
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: { id: string; email: string; name?: { firstName?: string; lastName?: string } },
    done: (err: Error | null, user?: AppleProfile) => void,
  ): Promise<void> {
    // Apple only sends the name on the first login
    const user: AppleProfile = {
      appleId: profile.id,
      email: profile.email,
      firstName: profile.name?.firstName,
      lastName: profile.name?.lastName,
    };

    done(null, user);
  }
}
