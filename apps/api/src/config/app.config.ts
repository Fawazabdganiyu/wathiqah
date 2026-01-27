import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  name: process.env.APP_NAME,
  version: process.env.APP_VERSION,
  url: process.env.APP_URL,
  apiPrefix: process.env.API_PREFIX,
  apiPort: parseInt(process.env.PORT || process.env.API_PORT || '3000'),
  env: process.env.NODE_ENV || 'development',
  appEmail: process.env.APP_EMAIL,
  emailFrom: process.env.EMAIL_FROM || 'no-reply@wathiqah.akanors.com',
}));
