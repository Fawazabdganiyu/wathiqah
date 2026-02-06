import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
import { EmailProvider, EmailPayload } from './email-provider.interface';

@Injectable()
export class SendGridEmailProvider implements EmailProvider {
  private readonly logger = new Logger(SendGridEmailProvider.name);
  private readonly defaultFrom: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('sendgrid.apiKey');
    this.defaultFrom = this.configService.get<string>('app.emailFrom');

    if (!apiKey) {
      this.logger.warn('SENDGRID_API_KEY is not set. Email sending will fail.');
    } else {
      sgMail.setApiKey(apiKey);
    }
  }

  async sendEmail(payload: EmailPayload): Promise<void> {
    const { to, subject, html, text, templateId, templateData } = payload;

    let msg: sgMail.MailDataRequired;

    if (templateId) {
      msg = {
        to,
        from: this.defaultFrom,
        subject,
        templateId,
        dynamicTemplateData: templateData ?? {},
      };
    } else {
      msg = {
        to,
        from: this.defaultFrom,
        subject,
        html: html ?? '',
        text: text ?? '',
      };
    }

    try {
      await sgMail.send(msg);
      this.logger.log(`Email sent to ${to} with subject "${subject}"`);
    } catch (error) {
      this.logger.error(`Error sending email to ${to}`, error as Error);
      throw error;
    }
  }
}
