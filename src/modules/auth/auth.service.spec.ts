import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

// Partial mock — keep real hash behavior for specific tests
jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
}));

jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue({ toString: () => 'mock_token_hex' }),
}));

const mockUser = {
  id: 'user-uuid-1',
  email: 'test@example.com',
  passwordHash: 'hashed_password',
  isVerified: true,
  role: UserRole.USER,
  isBanned: false,
  verificationToken: null,
  resetPasswordToken: null,
  resetPasswordExpires: null,
  googleId: null,
  githubId: null,
  appleId: null,
  avatarUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUsersService = {
  findOneByEmail: jest.fn(),
  findOneById: jest.fn(),
  findOneByVerificationToken: jest.fn(),
  findOneByResetToken: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock_jwt_token'),
  verify: jest.fn(),
};

const mockMailService = {
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
};

const mockConfigService = {
  get: jest.fn((key: string, defaultValue?: string) => {
    const config: Record<string, string> = {
      JWT_EXPIRATION: '1d',
      JWT_REFRESH_EXPIRATION: '7d',
    };
    return config[key] ?? defaultValue;
  }),
};

const mockRefreshTokenRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn().mockResolvedValue({ id: 'token-uuid' }),
  update: jest.fn().mockResolvedValue({ affected: 1 }),
  create: jest.fn().mockImplementation((data) => data),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: MailService, useValue: mockMailService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: getRepositoryToken(RefreshToken), useValue: mockRefreshTokenRepository },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── Register ────────────────────────────────────────────────
  describe('register', () => {
    const registerDto = { email: 'new@example.com', password: 'Password123!' };

    it('should register a new user and send verification email', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({ ...mockUser, email: registerDto.email });

      const result = await service.register(registerDto);

      expect(mockUsersService.findOneByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(mockUsersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: registerDto.email,
          passwordHash: 'hashed_password',
          isVerified: false,
        }),
      );
      expect(mockMailService.sendVerificationEmail).toHaveBeenCalledWith(
        registerDto.email,
        'mock_token_hex',
      );
      expect(result.email).toBe(registerDto.email);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  // ─── Login ───────────────────────────────────────────────────
  describe('login', () => {
    const loginDto = { email: 'test@example.com', password: 'Password123!' };

    it('should return tokens for valid credentials', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if email not verified', async () => {
      const unverifiedUser = { ...mockUser, isVerified: false };
      mockUsersService.findOneByEmail.mockResolvedValue(unverifiedUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── Refresh Tokens ──────────────────────────────────────────
  describe('refreshTokens', () => {
    it('should rotate tokens when valid refresh token is provided', async () => {
      const payload = { sub: 'user-uuid-1', email: 'test@example.com', role: 'user' };
      mockJwtService.verify.mockReturnValue(payload);
      mockUsersService.findOneById.mockResolvedValue(mockUser);

      const storedToken = {
        id: 'token-uuid',
        userId: 'user-uuid-1',
        tokenHash: 'stored_hash',
        isRevoked: false,
        expiresAt: new Date(Date.now() + 86400000), // future
        createdAt: new Date(),
      };
      mockRefreshTokenRepository.find.mockResolvedValueOnce([storedToken]);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      const result = await service.refreshTokens('valid_refresh_token');

      expect(result).toHaveProperty('accessToken');
      expect(mockRefreshTokenRepository.update).toHaveBeenCalledWith(storedToken.id, {
        isRevoked: true,
      });
    });

    it('should throw UnauthorizedException for invalid JWT', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('invalid');
      });

      await expect(service.refreshTokens('invalid_token')).rejects.toThrow(UnauthorizedException);
    });

    it('should revoke all sessions on token reuse detection', async () => {
      const payload = { sub: 'user-uuid-1', email: 'test@example.com', role: 'user' };
      mockJwtService.verify.mockReturnValue(payload);
      mockUsersService.findOneById.mockResolvedValue(mockUser);

      // No active tokens match
      mockRefreshTokenRepository.find.mockResolvedValueOnce([]);
      // But a revoked token matches → reuse detected
      const revokedToken = {
        id: 'old-token',
        userId: 'user-uuid-1',
        tokenHash: 'old_hash',
        isRevoked: true,
      };
      mockRefreshTokenRepository.find.mockResolvedValueOnce([revokedToken]);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      await expect(service.refreshTokens('reused_token')).rejects.toThrow(
        'Access Denied - Security Breach Detected',
      );
      expect(mockRefreshTokenRepository.update).toHaveBeenCalledWith(
        { userId: 'user-uuid-1' },
        { isRevoked: true },
      );
    });
  });

  // ─── Change Password ─────────────────────────────────────────
  describe('changePassword', () => {
    const dto = { oldPassword: 'OldPass123!', newPassword: 'NewPass456!' };

    it('should change password and revoke all sessions', async () => {
      mockUsersService.findOneById.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.changePassword('user-uuid-1', dto);

      expect(result.message).toBe('Password changed successfully');
      expect(mockUsersService.update).toHaveBeenCalledWith('user-uuid-1', {
        passwordHash: 'hashed_password',
      });
      expect(mockRefreshTokenRepository.update).toHaveBeenCalledWith(
        { userId: 'user-uuid-1' },
        { isRevoked: true },
      );
    });

    it('should throw if old password is incorrect', async () => {
      mockUsersService.findOneById.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.changePassword('user-uuid-1', dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ─── Forgot Password ─────────────────────────────────────────
  describe('forgotPassword', () => {
    it('should send reset email for existing user', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);

      const result = await service.forgotPassword('test@example.com');

      expect(mockUsersService.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({ resetPasswordToken: 'mock_token_hex' }),
      );
      expect(mockMailService.sendPasswordResetEmail).toHaveBeenCalled();
      expect(result.message).toContain('If this email exists');
    });

    it('should return same message for non-existing email (no info leak)', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);

      const result = await service.forgotPassword('nonexistent@example.com');

      expect(mockMailService.sendPasswordResetEmail).not.toHaveBeenCalled();
      expect(result.message).toContain('If this email exists');
    });
  });

  // ─── Reset Password ──────────────────────────────────────────
  describe('resetPassword', () => {
    const dto = { token: 'valid_reset_token', newPassword: 'NewPass789!' };

    it('should reset password and revoke all sessions', async () => {
      const userWithReset = {
        ...mockUser,
        resetPasswordToken: 'valid_reset_token',
        resetPasswordExpires: new Date(Date.now() + 3600000),
      };
      mockUsersService.findOneByResetToken.mockResolvedValue(userWithReset);

      const result = await service.resetPassword(dto);

      expect(result.message).toBe('Password has been reset successfully');
      expect(mockUsersService.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          passwordHash: 'hashed_password',
          resetPasswordToken: null,
          resetPasswordExpires: null,
        }),
      );
      expect(mockRefreshTokenRepository.update).toHaveBeenCalledWith(
        { userId: mockUser.id },
        { isRevoked: true },
      );
    });

    it('should throw for expired token', async () => {
      const userWithExpiredToken = {
        ...mockUser,
        resetPasswordToken: 'expired_token',
        resetPasswordExpires: new Date(Date.now() - 3600000), // past
      };
      mockUsersService.findOneByResetToken.mockResolvedValue(userWithExpiredToken);

      await expect(service.resetPassword(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw for invalid token', async () => {
      mockUsersService.findOneByResetToken.mockResolvedValue(null);

      await expect(service.resetPassword(dto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
