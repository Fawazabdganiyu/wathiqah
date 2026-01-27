import { registerAs } from '@nestjs/config';

export default registerAs('notifications', () => ({
  emailProvider: process.env.EMAIL_NOTIFICATIONS_PROVIDER || 'mailtrap',
}));
