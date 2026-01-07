import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';

import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const existingUser = await this.usersService.findOneByEmail(
      registerDto.email,
    );
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(registerDto.password, salt);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Send verification email
    await this.mailService.sendVerificationEmail(
      registerDto.email,
      verificationToken,
    );

    return this.usersService.create({
      email: registerDto.email,
      passwordHash,
      verificationToken,
    });
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

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user;
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
      throw new UnauthorizedException(
        'Please verify your email before logging in',
      );
    }
    return this.getTokens(user);
  }

  async logout(userId: string) {
    return this.usersService.update(userId, { refreshTokenHash: null });
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findOneById(userId);
    if (!user || !user.refreshTokenHash)
      throw new UnauthorizedException('Access Denied');

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    );
    if (!refreshTokenMatches) throw new UnauthorizedException('Access Denied');

    return this.getTokens(user);
  }

  async refreshTokensWithDecode(refreshToken: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        ignoreExpiration: false,
      });
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const userId = payload.sub;
    return this.refreshTokens(userId, refreshToken);
  }

  async changePassword(userId: string, changePasswordDto: any) {
    const user = await this.usersService.findOneById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    const passwordMatches = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.passwordHash,
    );
    if (!passwordMatches)
      throw new UnauthorizedException('Old password incorrect');

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(changePasswordDto.newPassword, salt);

    await this.usersService.update(userId, { passwordHash });
    return { message: 'Password changed successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not for security reasons
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

  async resetPassword(resetDto: any) {
    const user = await this.usersService.findOneByResetToken(resetDto.token);

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    // Manual expiration check if not handled by DB query
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

    return { message: 'Password has been reset successfully' };
  }

  private async getTokens(user: User) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    const salt = await bcrypt.genSalt();
    const refreshTokenHash = await bcrypt.hash(refreshToken, salt);
    await this.usersService.update(user.id, { refreshTokenHash });

    return {
      accessToken,
      refreshToken,
      user,
    };
  }
}
