import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User } from '../users/entities/user.entity';
import { MailService } from '../mail/mail.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { JwtPayload } from '../../common/interfaces';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
    private configService: ConfigService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const existingUser = await this.usersService.findOneByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(registerDto.password, salt);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await this.usersService.create({
      email: registerDto.email,
      passwordHash,
      verificationToken,
      isVerified: false,
    });

    await this.mailService.sendVerificationEmail(user.email, verificationToken);

    return user;
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.findOneByVerificationToken(token);
    if (!user) {
      throw new NotFoundException('Invalid verification token');
    }
    if (user.isVerified) {
      return { message: 'Email already verified' };
    }

    await this.usersService.update(user.id, {
      isVerified: true,
      verificationToken: null,
    });
    return { message: 'Email verified successfully' };
  }

  async validateUser(email: string, pass: string): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && user.passwordHash && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash: _passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }
    return this.getTokens(user);
  }

  async logout(userId: string, _refreshToken?: string) {
    // If we want to revoke only a specific token, we'd need its unique ID or a way to match the hash.
    // For now, we revoke all sessions for the user as a secure fallback.
    await this.refreshTokenRepository.update({ userId }, { isRevoked: true });
    return { message: 'Logged out successfully' };
  }

  async refreshTokens(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken);
    } catch (_error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const userId = payload.sub;
    const user = await this.usersService.findOneById(userId);
    if (!user) throw new UnauthorizedException('Access Denied');

    // Find token in DB
    // Optimization: We could use a unique ID (jti) in the JWT to find the exact record.
    // For now, we'll find all non-revoked tokens for this user and compare hashes.
    const userTokens = await this.refreshTokenRepository.find({
      where: { userId, isRevoked: false },
    });

    let foundToken: RefreshToken | null = null;
    for (const tokenEntity of userTokens) {
      if (await bcrypt.compare(refreshToken, tokenEntity.tokenHash)) {
        foundToken = tokenEntity;
        break;
      }
    }

    if (!foundToken) {
      // REUSE DETECTION: If we don't find it in active tokens, but it's a validly signed JWT,
      // it MIGHT be a reused token.
      const revokedTokens = await this.refreshTokenRepository.find({
        where: { userId, isRevoked: true },
        order: { createdAt: 'DESC' },
        take: 10,
      });

      for (const tokenEntity of revokedTokens) {
        if (await bcrypt.compare(refreshToken, tokenEntity.tokenHash)) {
          // EXTREME CAUTION: Token reuse detected!
          this.logger.warn(`Token reuse detected for user ${userId}! Revoking all sessions.`);
          await this.refreshTokenRepository.update({ userId }, { isRevoked: true });
          throw new UnauthorizedException('Access Denied - Security Breach Detected');
        }
      }
      throw new UnauthorizedException('Access Denied');
    }

    // Check expiration
    if (foundToken.expiresAt < new Date()) {
      await this.refreshTokenRepository.update(foundToken.id, { isRevoked: true });
      throw new UnauthorizedException('Refresh token expired');
    }

    // Rotate tokens
    const tokens = await this.getTokens(user);

    // Invalidate old token and link to new one
    // Note: getTokens creates a new record. We'd need the ID of the new record to link replacedBy.
    // Let's modify getTokens or handle linking here.

    await this.refreshTokenRepository.update(foundToken.id, { isRevoked: true });

    return tokens;
  }

  async refreshTokensWithDecode(refreshToken: string) {
    return this.refreshTokens(refreshToken);
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.usersService.findOneById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    if (!user.passwordHash) {
      throw new UnauthorizedException('Cannot change password for OAuth-only accounts');
    }

    const passwordMatches = await bcrypt.compare(changePasswordDto.oldPassword, user.passwordHash);
    if (!passwordMatches) throw new UnauthorizedException('Old password incorrect');

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(changePasswordDto.newPassword, salt);

    await this.usersService.update(userId, { passwordHash });

    // When password changes, it's good practice to revoke all sessions
    await this.refreshTokenRepository.update({ userId }, { isRevoked: true });

    return { message: 'Password changed successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      return {
        message: 'If this email exists, a password reset link has been sent.',
      };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour from now

    await this.usersService.update(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires,
    });

    await this.mailService.sendPasswordResetEmail(user.email, resetToken);

    return {
      message: 'If this email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(resetDto: ResetPasswordDto) {
    const user = await this.usersService.findOneByResetToken(resetDto.token);

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    if (user.resetPasswordExpires && new Date() > user.resetPasswordExpires) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(resetDto.newPassword, salt);

    await this.usersService.update(user.id, {
      passwordHash,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    // Revoke all sessions after password reset
    await this.refreshTokenRepository.update({ userId: user.id }, { isRevoked: true });

    return { message: 'Password has been reset successfully' };
  }

  async getTokens(user: Omit<User, 'passwordHash'>) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessTokenExpiration = this.configService.get<string>('JWT_EXPIRATION', '1d');
    const refreshTokenExpiration = this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d');

    // Cast is necessary because configService returns string, but sign expects a specific union of string literals for expiresIn
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: accessTokenExpiration as '1d',
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: refreshTokenExpiration as '7d',
    });

    // Hash and store the new refresh token
    const salt = await bcrypt.genSalt();
    const refreshTokenHash = await bcrypt.hash(refreshToken, salt);

    // Calculate expiration date
    // Simple parser for 1h, 1d, 7d etc.
    const match = refreshTokenExpiration.match(/^(\d+)([smhd])$/);
    const expiresAt = new Date();
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2];
      switch (unit) {
        case 's':
          expiresAt.setSeconds(expiresAt.getSeconds() + value);
          break;
        case 'm':
          expiresAt.setMinutes(expiresAt.getMinutes() + value);
          break;
        case 'h':
          expiresAt.setHours(expiresAt.getHours() + value);
          break;
        case 'd':
          expiresAt.setDate(expiresAt.getDate() + value);
          break;
      }
    } else {
      expiresAt.setDate(expiresAt.getDate() + 7); // Default 7 days
    }

    await this.refreshTokenRepository.save({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  // OAuth login handler
  async handleOAuthLogin(user: User) {
    if (!user) {
      throw new UnauthorizedException('OAuth login failed');
    }
    return this.getTokens(user);
  }
}
