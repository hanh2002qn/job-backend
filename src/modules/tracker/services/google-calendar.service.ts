import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, calendar_v3 } from 'googleapis';
import { InterviewSchedule } from '../entities/interview-schedule.entity';

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);
  private calendar: calendar_v3.Calendar | null = null;

  constructor(private configService: ConfigService) {
    this.initializeClient();
  }

  private initializeClient() {
    const clientId = this.configService.get<string>('GOOGLE_CALENDAR_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CALENDAR_CLIENT_SECRET');

    if (clientId && clientSecret) {
      const auth = new google.auth.OAuth2(clientId, clientSecret);
      this.calendar = google.calendar({ version: 'v3', auth });
      this.logger.log('Google Calendar client initialized');
    } else {
      this.logger.warn('Google Calendar credentials not configured');
    }
  }

  /**
   * Check if Google Calendar is configured
   */
  isConfigured(): boolean {
    return this.calendar !== null;
  }

  /**
   * Create a calendar event for an interview
   */
  async createEvent(
    interview: InterviewSchedule,
    userAccessToken: string,
    jobTitle: string,
    company: string,
  ): Promise<string | null> {
    if (!this.calendar) {
      this.logger.warn('Google Calendar not configured');
      return null;
    }

    try {
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: userAccessToken });

      const calendarWithAuth = google.calendar({ version: 'v3', auth });

      const endTime = new Date(interview.scheduledAt);
      endTime.setMinutes(endTime.getMinutes() + (interview.durationMinutes || 60));

      const event: calendar_v3.Schema$Event = {
        summary: `Interview: ${jobTitle} at ${company}`,
        description: `${interview.roundName}\n\nType: ${interview.type}\n\n${interview.notes || ''}`,
        start: {
          dateTime: interview.scheduledAt.toISOString(),
          timeZone: 'Asia/Ho_Chi_Minh',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'Asia/Ho_Chi_Minh',
        },
        location: interview.locationUrl || undefined,
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 60 }, // 1 hour before
            { method: 'popup', minutes: 15 }, // 15 minutes before
          ],
        },
      };

      const response = await calendarWithAuth.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });

      this.logger.log(`Created calendar event: ${response.data.id || 'unknown'}`);
      return response.data.id || null;
    } catch (error) {
      this.logger.error('Failed to create calendar event', error);
      return null;
    }
  }

  /**
   * Update an existing calendar event
   */
  async updateEvent(
    eventId: string,
    interview: InterviewSchedule,
    userAccessToken: string,
    jobTitle: string,
    company: string,
  ): Promise<boolean> {
    if (!this.calendar) {
      return false;
    }

    try {
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: userAccessToken });

      const calendarWithAuth = google.calendar({ version: 'v3', auth });

      const endTime = new Date(interview.scheduledAt);
      endTime.setMinutes(endTime.getMinutes() + (interview.durationMinutes || 60));

      const event: calendar_v3.Schema$Event = {
        summary: `Interview: ${jobTitle} at ${company}`,
        description: `${interview.roundName}\n\nType: ${interview.type}\n\n${interview.notes || ''}`,
        start: {
          dateTime: interview.scheduledAt.toISOString(),
          timeZone: 'Asia/Ho_Chi_Minh',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'Asia/Ho_Chi_Minh',
        },
        location: interview.locationUrl || undefined,
      };

      await calendarWithAuth.events.update({
        calendarId: 'primary',
        eventId,
        requestBody: event,
      });

      this.logger.log(`Updated calendar event: ${eventId}`);
      return true;
    } catch (error) {
      this.logger.error('Failed to update calendar event', error);
      return false;
    }
  }

  /**
   * Delete a calendar event
   */
  async deleteEvent(eventId: string, userAccessToken: string): Promise<boolean> {
    if (!this.calendar) {
      return false;
    }

    try {
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: userAccessToken });

      const calendarWithAuth = google.calendar({ version: 'v3', auth });

      await calendarWithAuth.events.delete({
        calendarId: 'primary',
        eventId,
      });

      this.logger.log(`Deleted calendar event: ${eventId}`);
      return true;
    } catch (error) {
      this.logger.error('Failed to delete calendar event', error);
      return false;
    }
  }
}
