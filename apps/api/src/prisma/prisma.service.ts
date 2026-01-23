import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(private configService: ConfigService) {
    const connectionString = `${configService.getOrThrow<string>('database.url')}`;
    const adapter = new PrismaPg({ connectionString });
    super({
      adapter,
    });
  }
}
