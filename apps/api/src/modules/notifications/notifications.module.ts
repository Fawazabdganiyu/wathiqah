import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationService } from './notification.service';
import { TemplateService } from './template.service';
import { MailtrapEmailProvider } from './providers/mailtrap-email.provider';
import { SendGridEmailProvider } from './providers/sendgrid-email.provider';
import { TwilioSmsProvider } from './providers/twilio-sms.provider';
import { EmailProvider } from './providers/email-provider.interface';
import { SmsProvider } from './providers/sms-provider.interface';

@Module({
  imports: [ConfigModule],
  providers: [
    NotificationService,
    TemplateService,
    {
      provide: EmailProvider,
      useFactory: (configService: ConfigService) => {
        const provider = (
          configService.get<string>('notifications.emailProvider') || 'mailtrap'
        ).toLowerCase();
        if (provider === 'sendgrid') {
          return new SendGridEmailProvider(configService);
        }
        return new MailtrapEmailProvider(configService);
      },
      inject: [ConfigService],
    },
    {
      provide: SmsProvider,
      useClass: TwilioSmsProvider,
    },
  ],
  exports: [NotificationService],
})
export class NotificationsModule {}
