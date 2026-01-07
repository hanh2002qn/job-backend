import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (!apiKey) {
      this.logger.error('SENDGRID_API_KEY is not defined');
    } else {
      SendGrid.setApiKey(apiKey);
    }
  }

  async sendVerificationEmail(to: string, token: string) {
    const from = this.configService.get<string>('SENDGRID_FROM_EMAIL');
    if (!from) {
      this.logger.error('SENDGRID_FROM_EMAIL is not configured');
      return;
    }

    // In production, use your frontend URL
    const url = `http://localhost:3000/auth/verify?token=${token}`;

    const msg = {
      to,
      from,
      subject: 'Verify your email - AI Job',
      text: `Welcome to AI Job! Please verify your email by clicking the following link: ${url}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to AI Job!</h2>
          <p>Please verify your email address to activate your account.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${url}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p><a href="${url}">${url}</a></p>
        </div>
      `,
    };

    try {
      await SendGrid.send(msg);
      this.logger.log(`Verification email sent to ${to}`);
    } catch (error) {
      this.logger.error('Error sending verification email', error);
      if (error.response) {
        this.logger.error(error.response.body);
      }
      // Don't throw error to prevent blocking registration flow,
      // but you might want to handle this differently in production
    }
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const from = this.configService.get<string>('SENDGRID_FROM_EMAIL');
    if (!from) {
      this.logger.error('SENDGRID_FROM_EMAIL is not configured');
      return;
    }

    // In production, use your frontend URL (e.g., http://localhost:3000/reset-password?token=...)
    const url = `http://localhost:3000/auth/reset-password?token=${token}`;

    const msg = {
      to,
      from,
      subject: 'Reset your password - AI Job',
      text: `You requested a password reset. Click the following link to reset your password: ${url}`,
      html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Reset Password</h2>
              <p>You requested a password reset. Click the button below to proceed.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${url}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
              </div>
              <p>If you didn't request this, please ignore this email.</p>
            </div>
          `,
    };

    try {
      await SendGrid.send(msg);
      this.logger.log(`Password reset email sent to ${to}`);
    } catch (error) {
      this.logger.error('Error sending password reset email', error);
    }
  }

  async sendReminderEmail(
    to: string,
    jobTitle: string,
    company: string,
    actionDate: Date,
  ) {
    const from = this.configService.get<string>('SENDGRID_FROM_EMAIL');
    if (!from) return;

    const dateStr = actionDate.toLocaleString('vi-VN');

    const msg = {
      to,
      from,
      subject: `Nhắc nhở công việc: ${jobTitle} tại ${company} - AI Job`,
      html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Bạn có lịch hẹn sắp tới!</h2>
              <p>Vị trí: <strong>${jobTitle}</strong></p>
              <p>Công ty: <strong>${company}</strong></p>
              <p>Thời gian: <strong>${dateStr}</strong></p>
              <p>Đừng quên chuẩn bị kỹ lưỡng cho buổi phỏng vấn hoặc hành động này nhé.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:3000/tracker" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Xem chi tiết</a>
              </div>
            </div>
          `,
    };

    try {
      await SendGrid.send(msg);
      this.logger.log(`Reminder email sent to ${to}`);
    } catch (error) {
      this.logger.error('Error sending reminder email', error);
    }
  }

  async sendJobAlertEmail(to: string, jobs: any[]) {
    const from = this.configService.get<string>('SENDGRID_FROM_EMAIL');
    if (!from) return;

    const jobListHtml = jobs
      .map(
        (job) => `
            <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
                <h4 style="margin: 0; color: #007bff;">${job.title}</h4>
                <p style="margin: 5px 0; font-size: 14px;"><strong>${job.company}</strong> - ${job.location}</p>
                <p style="margin: 5px 0; font-size: 13px; color: #666;">Lương: ${job.salary || 'Thỏa thuận'}</p>
                <a href="${job.url}" style="font-size: 13px; color: #007bff; text-decoration: none;">Xem chi tiết</a>
            </div>
        `,
      )
      .join('');

    const msg = {
      to,
      from,
      subject: `[AI Job] Gợi ý việc làm mới phù hợp với bạn`,
      html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px;">
              <h2 style="color: #333;">Việc làm mới dành cho bạn</h2>
              <p>Chào bạn, chúng tôi vừa tìm thấy một số công việc mới phù hợp với sở thích của bạn:</p>
              <div style="margin: 20px 0;">
                ${jobListHtml}
              </div>
              <p style="font-size: 12px; color: #999; margin-top: 30px;">
                Bạn nhận được email này vì đã thiết lập quan tâm ngành nghề trên AI Job.
              </p>
            </div>
          `,
    };

    try {
      await SendGrid.send(msg);
      this.logger.log(`Job alert email sent to ${to}`);
    } catch (error) {
      this.logger.error('Error sending job alert email', error);
    }
  }
}
