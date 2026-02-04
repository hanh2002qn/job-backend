import { Injectable } from '@nestjs/common';
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
      clientID: configService.get<string>('GITHUB_CLIENT_ID') || '',
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET') || '',
      callbackURL: configService.get<string>('GITHUB_CALLBACK_URL') || '',
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

    const user: GithubProfile = {
      githubId: id,
      email: emails?.[0]?.value || '',
      username: username || '',
      displayName: displayName || '',
      avatarUrl: photos?.[0]?.value || '',
    };

    done(null, user);
  }
}
