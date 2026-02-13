import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';

export interface GithubProfile {
  githubId: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string;
}

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID') || 'not-configured',
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET') || 'not-configured',
      callbackURL:
        configService.get<string>('GITHUB_CALLBACK_URL') ||
        'http://localhost:3000/auth/github/callback',
      scope: ['user:email'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (err: Error | null, user?: GithubProfile) => void,
  ): void {
    const { id, username, displayName, emails, photos } = profile;

    const emailObj = emails?.[0] as { value: string; verified: boolean };
    // GitHub emails from passport-github2 have a 'verified' property
    if (!emailObj?.verified) {
      return done(new UnauthorizedException('GitHub email not verified'));
    }

    const user: GithubProfile = {
      githubId: id,
      email: emailObj.value || '',
      username: username || '',
      displayName: displayName || '',
      avatarUrl: photos?.[0]?.value || '',
    };

    done(null, user);
  }
}
