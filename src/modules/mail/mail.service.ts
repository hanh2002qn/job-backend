import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as SendGrid from '@sendgrid/mail';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { JobAlertJob } from '../profiles/interfaces/profile.interface';
import { EmailPreference } from './entities/email-preference.entity';
import { UpdateMailPreferencesDto } from './dto/update-mail-preferences.dto';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly templates: Record<string, Handlebars.TemplateDelegate> = {};

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(EmailPreference)
    private readonly preferenceRepository: Repository<EmailPreference>,
  ) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (!apiKey) {
      this.logger.error('SENDGRID_API_KEY is not defined');
    } else {
      SendGrid.setApiKey(apiKey);
    }
    this.loadTemplates();
  }

  private loadTemplates() {
    const templateDir = path.join(__dirname, 'templates');
    const templateFiles = ['base', 'verification', 'password-reset', 'job-alert'];

    templateFiles.forEach((file) => {
      try {
        const filePath = path.join(templateDir, `${file}.hbs`);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          this.templates[file] = Handlebars.compile(content);
        }
      } catch (err: any) {
        this.logger.error(`Failed to load template ${file}: ${err.message as string}`);
      }
    });

    // Register base layout as partial if needed, but here we'll use a wrap approach
  }

  private render(templateName: string, data: Record<string, any>): string {
    const template = this.templates[templateName];
    if (!template) {
      this.logger.warn(`Template ${templateName} not found, falling back to empty body`);
      return '';
    }

    const body = template(data);
    const base = this.templates['base'];

    if (base) {
      return base({
        ...data,
        body,
        frontendUrl: this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000',
      });
    }

    return body;
  }

  async getPreferences(userId: string): Promise<EmailPreference> {
    let prefs = await this.preferenceRepository.findOne({ where: { userId } });
    if (!prefs) {
      prefs = this.preferenceRepository.create({ userId });
      await this.preferenceRepository.save(prefs);
    }
    return prefs;
  }

  async updatePreferences(userId: string, dto: UpdateMailPreferencesDto): Promise<EmailPreference> {
    const prefs = await this.getPreferences(userId);
    Object.assign(prefs, dto);
    return this.preferenceRepository.save(prefs);
  }

  async sendVerificationEmail(to: string, token: string) {
    const from = this.configService.get<string>('SENDGRID_FROM_EMAIL');
    if (!from) return;

    const url = `${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000'}/auth/verify?token=${token}`;

    const html = this.render('verification', { url, subject: 'Verify your email - AI Job' });

    const msg = {
      to,
      from,
      subject: 'Verify your email - AI Job',
      text: `Welcome to AI Job! Please verify your email: ${url}`,
      html,
    };

    try {
      await SendGrid.send(msg);
      this.logger.log(`Verification email sent to ${to}`);
    } catch (error) {
      this.logger.error('Error sending verification email', error);
    }
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const from = this.configService.get<string>('SENDGRID_FROM_EMAIL');
    if (!from) return;

    const url = `${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000'}/auth/reset-password?token=${token}`;

    const html = this.render('password-reset', { url, subject: 'Reset your password - AI Job' });

    const msg = {
      to,
      from,
      subject: 'Reset your password - AI Job',
      text: `Click the following link to reset your password: ${url}`,
      html,
    };

    try {
      await SendGrid.send(msg);
      this.logger.log(`Password reset email sent to ${to}`);
    } catch (error) {
      this.logger.error('Error sending password reset email', error);
    }
  }

  async sendReminderEmail(
    userId: string,
    to: string,
    jobTitle: string,
    company: string,
    actionDate: Date,
  ) {
    const prefs = await this.getPreferences(userId);
    if (!prefs.applicationReminders) return;

    const from = this.configService.get<string>('SENDGRID_FROM_EMAIL');
    if (!from) return;

    const dateStr = actionDate.toLocaleString('vi-VN');
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    const msg = {
      to,
      from,
      subject: `Nhắc nhở công việc: ${jobTitle} tại ${company} - AI Job`,
      html: this.render('base', {
        subject: `Bạn có lịch hẹn sắp tới!`,
        body: `
          <h2>Bạn có lịch hẹn sắp tới!</h2>
          <p>Vị trí: <strong>${jobTitle}</strong></p>
          <p>Công ty: <strong>${company}</strong></p>
          <p>Thời gian: <strong>${dateStr}</strong></p>
          <p>Đừng quên chuẩn bị kỹ lưỡng cho buổi phỏng vấn hoặc hành động này nhé.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${frontendUrl}/tracker" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Xem chi tiết</a>
          </div>
        `,
      }),
    };

    try {
      await SendGrid.send(msg);
      this.logger.log(`Reminder email sent to ${to}`);
    } catch (error) {
      this.logger.error('Error sending reminder email', error);
    }
  }

  async sendJobAlertEmail(userId: string, to: string, jobs: JobAlertJob[]) {
    const prefs = await this.getPreferences(userId);
    if (!prefs.jobAlerts) return;

    const from = this.configService.get<string>('SENDGRID_FROM_EMAIL');
    if (!from) return;

    const html = this.render('job-alert', {
      jobs,
      subject: `[AI Job] Gợi ý việc làm mới phù hợp với bạn`,
      frontendUrl: this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000',
    });

    const msg = {
      to,
      from,
      subject: `[AI Job] Gợi ý việc làm mới phù hợp với bạn`,
      html,
    };

    try {
      await SendGrid.send(msg);
      this.logger.log(`Job alert email sent to ${to}`);
    } catch (error) {
      this.logger.error('Error sending job alert email', error);
    }
  }
}
