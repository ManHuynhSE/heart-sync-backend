import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    super({
      datasources: {
        db: {
          url: PrismaService.normalizeRuntimeUrl(databaseUrl),
        },
      },
    });
  }

  async onModuleInit() {
    if (!process.env.DATABASE_URL) return;
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private static normalizeRuntimeUrl(url?: string) {
    if (!url) return url;

    const parsed = new URL(url);
    if (parsed.port !== '6543' || !parsed.hostname.includes('pooler')) {
      return url;
    }

    parsed.searchParams.set('pgbouncer', 'true');
    parsed.searchParams.set(
      'connection_limit',
      parsed.searchParams.get('connection_limit') ?? '5',
    );
    return parsed.toString();
  }
}
